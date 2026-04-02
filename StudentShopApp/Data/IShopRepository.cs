using StudentShopApp.ViewModels;

namespace StudentShopApp.Data;

public interface IShopRepository
{
    Task<IReadOnlyList<CustomerOptionViewModel>> GetCustomersAsync();
    Task<CustomerSummaryViewModel?> GetCustomerSummaryAsync(int customerId);
    Task<IReadOnlyList<OrderSummaryViewModel>> GetRecentOrdersAsync(int customerId, int count);
    Task<IReadOnlyList<OrderSummaryViewModel>> GetOrdersForCustomerAsync(int customerId);
    Task<OrderDetailViewModel?> GetOrderDetailAsync(int orderId, int? customerId = null);
    Task<IReadOnlyList<ProductOptionViewModel>> GetActiveProductsAsync();
    Task<IReadOnlyList<WarehousePriorityItemViewModel>> GetWarehousePriorityQueueAsync();
    Task<PlacedOrderResultViewModel> CreateOrderAsync(int customerId, PlaceOrderInputViewModel input);
}
