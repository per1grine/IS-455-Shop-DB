namespace StudentShopApp.ViewModels;

public sealed class OrderDetailViewModel
{
    public int OrderId { get; init; }
    public int CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string OrderDateTime { get; init; } = string.Empty;
    public string PaymentMethod { get; init; } = string.Empty;
    public string DeviceType { get; init; } = string.Empty;
    public string ShippingState { get; init; } = string.Empty;
    public string BillingZip { get; init; } = string.Empty;
    public string ShippingZip { get; init; } = string.Empty;
    public string PriorityBucket { get; init; } = "unscored";
    public decimal? PriorityScore { get; init; }
    public string? PredictionReason { get; init; }
    public decimal Subtotal { get; init; }
    public decimal ShippingFee { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal OrderTotal { get; init; }
    public IReadOnlyList<OrderDetailLineItemViewModel> LineItems { get; set; } = [];
}
