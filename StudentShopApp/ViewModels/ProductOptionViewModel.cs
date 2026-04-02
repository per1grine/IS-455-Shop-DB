namespace StudentShopApp.ViewModels;

public sealed class ProductOptionViewModel
{
    public int ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public decimal Price { get; init; }
}
