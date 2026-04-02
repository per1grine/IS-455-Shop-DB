using System.ComponentModel.DataAnnotations;

namespace StudentShopApp.ViewModels;

public sealed class OrderItemInputViewModel
{
    [Display(Name = "Product")]
    public int? ProductId { get; set; }

    [Range(0, 999, ErrorMessage = "Quantity must be zero or greater.")]
    public int Quantity { get; set; }
}
