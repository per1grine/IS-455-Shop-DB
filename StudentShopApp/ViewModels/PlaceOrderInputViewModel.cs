using System.ComponentModel.DataAnnotations;

namespace StudentShopApp.ViewModels;

public sealed class PlaceOrderInputViewModel
{
    [Required]
    [Display(Name = "Billing ZIP")]
    public string BillingZip { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Shipping ZIP")]
    public string ShippingZip { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Shipping State")]
    public string ShippingState { get; set; } = string.Empty;

    [Required]
    [Display(Name = "Payment Method")]
    public string PaymentMethod { get; set; } = "card";

    [Required]
    [Display(Name = "Device Type")]
    public string DeviceType { get; set; } = "desktop";

    [Required]
    [Display(Name = "IP Country")]
    public string IpCountry { get; set; } = "US";

    [Display(Name = "Promo Applied")]
    public bool PromoUsed { get; set; }

    [Display(Name = "Promo Code")]
    public string? PromoCode { get; set; }

    public List<OrderItemInputViewModel> Items { get; set; } = [];
}
