namespace StudentShopApp.ViewModels;

public sealed class DashboardViewModel
{
    public CustomerSummaryViewModel Customer { get; init; } = new();
    public IReadOnlyList<OrderSummaryViewModel> RecentOrders { get; init; } = [];
}
