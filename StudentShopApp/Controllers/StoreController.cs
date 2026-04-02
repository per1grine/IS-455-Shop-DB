using Microsoft.AspNetCore.Mvc;
using StudentShopApp.Data;
using StudentShopApp.Services;
using StudentShopApp.ViewModels;

namespace StudentShopApp.Controllers;

[Route("")]
public sealed class StoreController : Controller
{
    private readonly IShopRepository _repository;
    private readonly CustomerContextService _customerContext;
    private readonly InferenceRunner _inferenceRunner;

    public StoreController(
        IShopRepository repository,
        CustomerContextService customerContext,
        InferenceRunner inferenceRunner)
    {
        _repository = repository;
        _customerContext = customerContext;
        _inferenceRunner = inferenceRunner;
    }

    [HttpGet("")]
    public IActionResult Index()
    {
        return _customerContext.GetCurrentCustomerId(Request).HasValue
            ? RedirectToAction(nameof(Dashboard))
            : RedirectToAction(nameof(SelectCustomer));
    }

    [HttpGet("select-customer")]
    public async Task<IActionResult> SelectCustomer()
    {
        var customers = await _repository.GetCustomersAsync();
        var currentCustomerId = _customerContext.GetCurrentCustomerId(Request);

        ViewBag.ActiveCustomerLabel = currentCustomerId.HasValue
            ? $"Current customer ID: {currentCustomerId.Value}"
            : "No customer selected";

        return View(new SelectCustomerPageViewModel
        {
            Customers = customers,
            SelectedCustomerId = currentCustomerId
        });
    }

    [HttpPost("select-customer")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SelectCustomer(int customerId)
    {
        var customer = await _repository.GetCustomerSummaryAsync(customerId);
        if (customer is null)
        {
            TempData["ErrorMessage"] = "That customer was not found.";
            return RedirectToAction(nameof(SelectCustomer));
        }

        _customerContext.SetCurrentCustomerId(Response, customerId);
        TempData["StatusMessage"] = $"You are now acting as {customer.FullName}.";
        return RedirectToAction(nameof(Dashboard));
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var customer = await RequireCustomerAsync();
        if (customer is null)
        {
            return RedirectToAction(nameof(SelectCustomer));
        }

        var recentOrders = await _repository.GetRecentOrdersAsync(customer.CustomerId, 8);
        ViewBag.ActiveCustomerLabel = $"Acting as: {customer.FullName}";

        return View(new DashboardViewModel
        {
            Customer = customer,
            RecentOrders = recentOrders
        });
    }

    [HttpGet("place-order")]
    public async Task<IActionResult> PlaceOrder()
    {
        var customer = await RequireCustomerAsync();
        if (customer is null)
        {
            return RedirectToAction(nameof(SelectCustomer));
        }

        ViewBag.ActiveCustomerLabel = $"Acting as: {customer.FullName}";
        return View(await BuildPlaceOrderPageAsync(customer, BuildDefaultOrderForm(customer)));
    }

    [HttpPost("place-order")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> PlaceOrder(PlaceOrderInputViewModel form)
    {
        var customer = await RequireCustomerAsync();
        if (customer is null)
        {
            return RedirectToAction(nameof(SelectCustomer));
        }

        NormalizeOrderItems(form);
        ValidateOrderForm(form);

        if (!ModelState.IsValid)
        {
            ViewBag.ActiveCustomerLabel = $"Acting as: {customer.FullName}";
            return View(await BuildPlaceOrderPageAsync(customer, form));
        }

        var result = await _repository.CreateOrderAsync(customer.CustomerId, form);
        TempData["StatusMessage"] = $"Order #{result.OrderId} created. Total charged: {result.Total:C}.";
        return RedirectToAction(nameof(OrderDetail), new { orderId = result.OrderId });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> Orders()
    {
        var customer = await RequireCustomerAsync();
        if (customer is null)
        {
            return RedirectToAction(nameof(SelectCustomer));
        }

        var orders = await _repository.GetOrdersForCustomerAsync(customer.CustomerId);
        ViewBag.ActiveCustomerLabel = $"Acting as: {customer.FullName}";
        ViewBag.CustomerName = customer.FullName;
        return View(orders);
    }

    [HttpGet("orders/{orderId:int}")]
    public async Task<IActionResult> OrderDetail(int orderId)
    {
        var customer = await RequireCustomerAsync();
        if (customer is null)
        {
            return RedirectToAction(nameof(SelectCustomer));
        }

        var detail = await _repository.GetOrderDetailAsync(orderId, customer.CustomerId);
        if (detail is null)
        {
            TempData["ErrorMessage"] = "That order does not exist for the active customer.";
            return RedirectToAction(nameof(Orders));
        }

        ViewBag.ActiveCustomerLabel = $"Acting as: {customer.FullName}";
        return View(detail);
    }

    [HttpGet("warehouse/priority")]
    public async Task<IActionResult> WarehousePriority()
    {
        var queue = await _repository.GetWarehousePriorityQueueAsync();
        var currentCustomerId = _customerContext.GetCurrentCustomerId(Request);
        ViewBag.ActiveCustomerLabel = currentCustomerId.HasValue
            ? $"Current customer ID: {currentCustomerId.Value}"
            : "Warehouse view";
        return View(queue);
    }

    [HttpPost("scoring/run")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RunScoring(CancellationToken cancellationToken)
    {
        var result = await _inferenceRunner.RunAsync(cancellationToken);
        return Json(result);
    }

    private async Task<CustomerSummaryViewModel?> RequireCustomerAsync()
    {
        var customerId = _customerContext.GetCurrentCustomerId(Request);
        if (!customerId.HasValue)
        {
            return null;
        }

        return await _repository.GetCustomerSummaryAsync(customerId.Value);
    }

    private async Task<PlaceOrderPageViewModel> BuildPlaceOrderPageAsync(CustomerSummaryViewModel customer, PlaceOrderInputViewModel form)
    {
        NormalizeOrderItems(form);

        return new PlaceOrderPageViewModel
        {
            Customer = customer,
            Form = form,
            Products = await _repository.GetActiveProductsAsync()
        };
    }

    private static PlaceOrderInputViewModel BuildDefaultOrderForm(CustomerSummaryViewModel customer)
    {
        var form = new PlaceOrderInputViewModel
        {
            ShippingState = customer.State,
            Items = []
        };

        for (var i = 0; i < 5; i++)
        {
            form.Items.Add(new OrderItemInputViewModel());
        }

        return form;
    }

    private void ValidateOrderForm(PlaceOrderInputViewModel form)
    {
        if (form.Items.All(item => !item.ProductId.HasValue || item.Quantity <= 0))
        {
            ModelState.AddModelError(string.Empty, "Add at least one product with a quantity greater than zero.");
        }

        for (var i = 0; i < form.Items.Count; i++)
        {
            var item = form.Items[i];
            if (item.ProductId.HasValue && item.Quantity <= 0)
            {
                ModelState.AddModelError($"Form.Items[{i}].Quantity", "Quantity must be greater than zero when a product is selected.");
            }

            if (!item.ProductId.HasValue && item.Quantity > 0)
            {
                ModelState.AddModelError($"Form.Items[{i}].ProductId", "Select a product for any row with quantity.");
            }
        }
    }

    private static void NormalizeOrderItems(PlaceOrderInputViewModel form)
    {
        form.Items ??= [];

        while (form.Items.Count < 5)
        {
            form.Items.Add(new OrderItemInputViewModel());
        }
    }
}
