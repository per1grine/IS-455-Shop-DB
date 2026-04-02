namespace StudentShopApp.ViewModels;

public sealed class OrderSummaryViewModel
{
    public int OrderId { get; init; }
    public string OrderDateTime { get; init; } = string.Empty;
    public decimal OrderTotal { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string DeviceType { get; init; } = string.Empty;
    public string PriorityBucket { get; init; } = "unscored";
    public decimal? PriorityScore { get; init; }
}
