using Microsoft.AspNetCore.Http;

namespace StudentShopApp.Services;

public sealed class CustomerContextService
{
    public const string CookieName = "student_shop_customer_id";

    public int? GetCurrentCustomerId(HttpRequest request)
    {
        if (request.Cookies.TryGetValue(CookieName, out var rawValue) &&
            int.TryParse(rawValue, out var customerId))
        {
            return customerId;
        }

        return null;
    }

    public void SetCurrentCustomerId(HttpResponse response, int customerId)
    {
        response.Cookies.Append(
            CookieName,
            customerId.ToString(),
            new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(30)
            });
    }
}
