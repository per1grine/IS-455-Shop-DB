namespace StudentShopApp.ViewModels;

public sealed class PlacedOrderResultViewModel
{
    public int OrderId { get; init; }
    public decimal Subtotal { get; init; }
    public decimal ShippingFee { get; init; }
    public decimal TaxAmount { get; init; }
    public decimal Total { get; init; }
}
