namespace StudentShopApp.ViewModels;

public sealed class CustomerSummaryViewModel
{
    public int CustomerId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Segment { get; init; } = string.Empty;
    public string LoyaltyTier { get; init; } = string.Empty;
    public int OrderCount { get; init; }
    public decimal TotalSpent { get; init; }
    public decimal AverageOrderTotal { get; init; }
    public string? LastOrderDate { get; init; }
}
