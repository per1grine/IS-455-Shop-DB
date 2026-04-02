namespace StudentShopApp.ViewModels;

public sealed class WarehousePriorityItemViewModel
{
    public int OrderId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerState { get; init; } = string.Empty;
    public string OrderDateTime { get; init; } = string.Empty;
    public decimal OrderTotal { get; init; }
    public string PriorityBucket { get; init; } = string.Empty;
    public decimal PriorityScore { get; init; }
    public int EstimatedShipHours { get; init; }
    public string PredictionReason { get; init; } = string.Empty;
    public int PromisedDays { get; init; }
    public int ActualDays { get; init; }
    public string Carrier { get; init; } = string.Empty;
}
