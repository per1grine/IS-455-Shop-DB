namespace StudentShopApp.ViewModels;

public sealed class PlaceOrderPageViewModel
{
    public CustomerSummaryViewModel Customer { get; init; } = new();
    public PlaceOrderInputViewModel Form { get; init; } = new();
    public IReadOnlyList<ProductOptionViewModel> Products { get; init; } = [];
    public decimal TaxRatePercent { get; init; } = 8m;
}
