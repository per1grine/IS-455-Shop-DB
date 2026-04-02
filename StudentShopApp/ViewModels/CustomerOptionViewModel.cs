namespace StudentShopApp.ViewModels;

public sealed class CustomerOptionViewModel
{
    public int CustomerId { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Segment { get; init; } = string.Empty;
    public string LoyaltyTier { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
}
