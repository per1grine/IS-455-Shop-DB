namespace StudentShopApp.ViewModels;

public sealed class SelectCustomerPageViewModel
{
    public IReadOnlyList<CustomerOptionViewModel> Customers { get; init; } = [];
    public int? SelectedCustomerId { get; init; }
}
