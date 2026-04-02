using Microsoft.Data.Sqlite;
using StudentShopApp.Models;
using StudentShopApp.ViewModels;

namespace StudentShopApp.Data;

public sealed class ShopRepository : IShopRepository
{
    private const decimal TaxRate = 0.08m;
    private readonly string _connectionString;

    public ShopRepository(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var settings = configuration.GetSection("AppSettings").Get<AppSettings>() ?? new AppSettings();
        var databasePath = Path.IsPathRooted(settings.DatabasePath)
            ? settings.DatabasePath
            : Path.GetFullPath(Path.Combine(environment.ContentRootPath, settings.DatabasePath));

        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = databasePath,
            Mode = SqliteOpenMode.ReadWriteCreate
        }.ToString();
    }

    public async Task<IReadOnlyList<CustomerOptionViewModel>> GetCustomersAsync()
    {
        const string sql = """
            SELECT customer_id, full_name, email, COALESCE(customer_segment, ''),
                   COALESCE(loyalty_tier, ''), COALESCE(state, '')
            FROM customers
            WHERE is_active = 1
            ORDER BY full_name;
            """;

        var results = new List<CustomerOptionViewModel>();
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results.Add(new CustomerOptionViewModel
            {
                CustomerId = reader.GetInt32(0),
                FullName = reader.GetString(1),
                Email = reader.GetString(2),
                Segment = reader.GetString(3),
                LoyaltyTier = reader.GetString(4),
                State = reader.GetString(5)
            });
        }

        return results;
    }

    public async Task<CustomerSummaryViewModel?> GetCustomerSummaryAsync(int customerId)
    {
        const string sql = """
            SELECT c.customer_id,
                   c.full_name,
                   c.email,
                   COALESCE(c.city, ''),
                   COALESCE(c.state, ''),
                   COALESCE(c.customer_segment, ''),
                   COALESCE(c.loyalty_tier, ''),
                   COUNT(o.order_id),
                   COALESCE(SUM(o.order_total), 0),
                   COALESCE(AVG(o.order_total), 0),
                   MAX(o.order_datetime)
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.customer_id
            WHERE c.customer_id = $customerId
            GROUP BY c.customer_id, c.full_name, c.email, c.city, c.state, c.customer_segment, c.loyalty_tier;
            """;

        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("$customerId", customerId);

        await using var reader = await command.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        return new CustomerSummaryViewModel
        {
            CustomerId = reader.GetInt32(0),
            FullName = reader.GetString(1),
            Email = reader.GetString(2),
            City = reader.GetString(3),
            State = reader.GetString(4),
            Segment = reader.GetString(5),
            LoyaltyTier = reader.GetString(6),
            OrderCount = reader.GetInt32(7),
            TotalSpent = GetDecimal(reader, 8),
            AverageOrderTotal = GetDecimal(reader, 9),
            LastOrderDate = reader.IsDBNull(10) ? null : reader.GetString(10)
        };
    }

    public async Task<IReadOnlyList<OrderSummaryViewModel>> GetRecentOrdersAsync(int customerId, int count)
    {
        const string sql = """
            SELECT o.order_id,
                   o.order_datetime,
                   o.order_total,
                   o.payment_method,
                   o.device_type,
                   COALESCE(op.priority_bucket, 'unscored'),
                   op.predicted_priority_score
            FROM orders o
            LEFT JOIN order_predictions op ON op.order_id = o.order_id
            WHERE o.customer_id = $customerId
            ORDER BY o.order_datetime DESC
            LIMIT $count;
            """;

        return await ReadOrderSummariesAsync(sql, ("$customerId", customerId), ("$count", count));
    }

    public async Task<IReadOnlyList<OrderSummaryViewModel>> GetOrdersForCustomerAsync(int customerId)
    {
        const string sql = """
            SELECT o.order_id,
                   o.order_datetime,
                   o.order_total,
                   o.payment_method,
                   o.device_type,
                   COALESCE(op.priority_bucket, 'unscored'),
                   op.predicted_priority_score
            FROM orders o
            LEFT JOIN order_predictions op ON op.order_id = o.order_id
            WHERE o.customer_id = $customerId
            ORDER BY o.order_datetime DESC, o.order_id DESC;
            """;

        return await ReadOrderSummariesAsync(sql, ("$customerId", customerId));
    }

    public async Task<OrderDetailViewModel?> GetOrderDetailAsync(int orderId, int? customerId = null)
    {
        const string headerSql = """
            SELECT o.order_id,
                   o.customer_id,
                   c.full_name,
                   o.order_datetime,
                   o.payment_method,
                   o.device_type,
                   COALESCE(o.shipping_state, ''),
                   COALESCE(o.billing_zip, ''),
                   COALESCE(o.shipping_zip, ''),
                   COALESCE(op.priority_bucket, 'unscored'),
                   op.predicted_priority_score,
                   op.prediction_reason,
                   o.order_subtotal,
                   o.shipping_fee,
                   o.tax_amount,
                   o.order_total
            FROM orders o
            INNER JOIN customers c ON c.customer_id = o.customer_id
            LEFT JOIN order_predictions op ON op.order_id = o.order_id
            WHERE o.order_id = $orderId
              AND ($customerId IS NULL OR o.customer_id = $customerId);
            """;

        const string itemsSql = """
            SELECT p.product_name, p.sku, p.category, oi.quantity, oi.unit_price, oi.line_total
            FROM order_items oi
            INNER JOIN products p ON p.product_id = oi.product_id
            WHERE oi.order_id = $orderId
            ORDER BY oi.order_item_id;
            """;

        await using var connection = await OpenConnectionAsync();
        await using var headerCommand = connection.CreateCommand();
        headerCommand.CommandText = headerSql;
        headerCommand.Parameters.AddWithValue("$orderId", orderId);
        headerCommand.Parameters.AddWithValue("$customerId", customerId is null ? DBNull.Value : customerId.Value);

        await using var reader = await headerCommand.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
        {
            return null;
        }

        var detail = new OrderDetailViewModel
        {
            OrderId = reader.GetInt32(0),
            CustomerId = reader.GetInt32(1),
            CustomerName = reader.GetString(2),
            OrderDateTime = reader.GetString(3),
            PaymentMethod = reader.GetString(4),
            DeviceType = reader.GetString(5),
            ShippingState = reader.GetString(6),
            BillingZip = reader.GetString(7),
            ShippingZip = reader.GetString(8),
            PriorityBucket = reader.GetString(9),
            PriorityScore = reader.IsDBNull(10) ? null : GetDecimal(reader, 10),
            PredictionReason = reader.IsDBNull(11) ? null : reader.GetString(11),
            Subtotal = GetDecimal(reader, 12),
            ShippingFee = GetDecimal(reader, 13),
            TaxAmount = GetDecimal(reader, 14),
            OrderTotal = GetDecimal(reader, 15)
        };

        var items = new List<OrderDetailLineItemViewModel>();
        await using var itemsCommand = connection.CreateCommand();
        itemsCommand.CommandText = itemsSql;
        itemsCommand.Parameters.AddWithValue("$orderId", orderId);

        await using var itemReader = await itemsCommand.ExecuteReaderAsync();
        while (await itemReader.ReadAsync())
        {
            items.Add(new OrderDetailLineItemViewModel
            {
                ProductName = itemReader.GetString(0),
                Sku = itemReader.GetString(1),
                Category = itemReader.GetString(2),
                Quantity = itemReader.GetInt32(3),
                UnitPrice = GetDecimal(itemReader, 4),
                LineTotal = GetDecimal(itemReader, 5)
            });
        }

        detail.LineItems = items;
        return detail;
    }

    public async Task<IReadOnlyList<ProductOptionViewModel>> GetActiveProductsAsync()
    {
        const string sql = """
            SELECT product_id, product_name, category, price
            FROM products
            WHERE is_active = 1
            ORDER BY category, product_name;
            """;

        var products = new List<ProductOptionViewModel>();
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            products.Add(new ProductOptionViewModel
            {
                ProductId = reader.GetInt32(0),
                ProductName = reader.GetString(1),
                Category = reader.GetString(2),
                Price = GetDecimal(reader, 3)
            });
        }

        return products;
    }

    public async Task<IReadOnlyList<WarehousePriorityItemViewModel>> GetWarehousePriorityQueueAsync()
    {
        const string sql = """
            SELECT o.order_id,
                   c.full_name,
                   COALESCE(c.state, ''),
                   o.order_datetime,
                   o.order_total,
                   op.priority_bucket,
                   op.predicted_priority_score,
                   op.estimated_ship_hours,
                   op.prediction_reason,
                   s.promised_days,
                   s.actual_days,
                   s.carrier
            FROM shipments s
            INNER JOIN orders o ON o.order_id = s.order_id
            INNER JOIN customers c ON c.customer_id = o.customer_id
            INNER JOIN order_predictions op ON op.order_id = o.order_id
            WHERE s.late_delivery = 1
            ORDER BY CASE op.priority_bucket
                         WHEN 'high' THEN 1
                         WHEN 'medium' THEN 2
                         ELSE 3
                     END,
                     op.predicted_priority_score DESC,
                     s.actual_days - s.promised_days DESC;
            """;

        var queue = new List<WarehousePriorityItemViewModel>();
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            queue.Add(new WarehousePriorityItemViewModel
            {
                OrderId = reader.GetInt32(0),
                CustomerName = reader.GetString(1),
                CustomerState = reader.GetString(2),
                OrderDateTime = reader.GetString(3),
                OrderTotal = GetDecimal(reader, 4),
                PriorityBucket = reader.GetString(5),
                PriorityScore = GetDecimal(reader, 6),
                EstimatedShipHours = reader.GetInt32(7),
                PredictionReason = reader.GetString(8),
                PromisedDays = reader.GetInt32(9),
                ActualDays = reader.GetInt32(10),
                Carrier = reader.GetString(11)
            });
        }

        return queue;
    }

    public async Task<PlacedOrderResultViewModel> CreateOrderAsync(int customerId, PlaceOrderInputViewModel input)
    {
        var requestedItems = input.Items
            .Where(item => item.ProductId.HasValue && item.Quantity > 0)
            .GroupBy(item => item.ProductId!.Value)
            .Select(group => new { ProductId = group.Key, Quantity = group.Sum(item => item.Quantity) })
            .ToList();

        if (requestedItems.Count == 0)
        {
            throw new InvalidOperationException("At least one line item is required.");
        }

        await using var connection = await OpenConnectionAsync();
        await using var transaction = (SqliteTransaction)await connection.BeginTransactionAsync();

        var products = await LoadProductsByIdAsync(connection, transaction, requestedItems.Select(item => item.ProductId));
        var orderLines = requestedItems.Select(item =>
        {
            if (!products.TryGetValue(item.ProductId, out var product))
            {
                throw new InvalidOperationException($"Product {item.ProductId} was not found.");
            }

            return new
            {
                item.ProductId,
                item.Quantity,
                UnitPrice = product.Price,
                LineTotal = decimal.Round(product.Price * item.Quantity, 2)
            };
        }).ToList();

        var subtotal = orderLines.Sum(line => line.LineTotal);
        var shippingFee = subtotal >= 100m ? 5m : 12m;
        var taxAmount = decimal.Round(subtotal * TaxRate, 2);
        var total = subtotal + shippingFee + taxAmount;
        var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

        await using var orderCommand = connection.CreateCommand();
        orderCommand.Transaction = transaction;
        orderCommand.CommandText = """
            INSERT INTO orders
            (
                customer_id, order_datetime, billing_zip, shipping_zip, shipping_state,
                payment_method, device_type, ip_country, promo_used, promo_code,
                order_subtotal, shipping_fee, tax_amount, order_total, risk_score, is_fraud
            )
            VALUES
            (
                $customerId, $orderDatetime, $billingZip, $shippingZip, $shippingState,
                $paymentMethod, $deviceType, $ipCountry, $promoUsed, $promoCode,
                $subtotal, $shippingFee, $taxAmount, $orderTotal, 0, 0
            );
            SELECT last_insert_rowid();
            """;
        orderCommand.Parameters.AddWithValue("$customerId", customerId);
        orderCommand.Parameters.AddWithValue("$orderDatetime", now);
        orderCommand.Parameters.AddWithValue("$billingZip", input.BillingZip);
        orderCommand.Parameters.AddWithValue("$shippingZip", input.ShippingZip);
        orderCommand.Parameters.AddWithValue("$shippingState", input.ShippingState);
        orderCommand.Parameters.AddWithValue("$paymentMethod", input.PaymentMethod);
        orderCommand.Parameters.AddWithValue("$deviceType", input.DeviceType);
        orderCommand.Parameters.AddWithValue("$ipCountry", input.IpCountry);
        orderCommand.Parameters.AddWithValue("$promoUsed", input.PromoUsed ? 1 : 0);
        orderCommand.Parameters.AddWithValue("$promoCode", string.IsNullOrWhiteSpace(input.PromoCode) ? DBNull.Value : input.PromoCode);
        orderCommand.Parameters.AddWithValue("$subtotal", subtotal);
        orderCommand.Parameters.AddWithValue("$shippingFee", shippingFee);
        orderCommand.Parameters.AddWithValue("$taxAmount", taxAmount);
        orderCommand.Parameters.AddWithValue("$orderTotal", total);

        var orderId = Convert.ToInt32(await orderCommand.ExecuteScalarAsync());

        foreach (var line in orderLines)
        {
            await using var itemCommand = connection.CreateCommand();
            itemCommand.Transaction = transaction;
            itemCommand.CommandText = """
                INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
                VALUES ($orderId, $productId, $quantity, $unitPrice, $lineTotal);
                """;
            itemCommand.Parameters.AddWithValue("$orderId", orderId);
            itemCommand.Parameters.AddWithValue("$productId", line.ProductId);
            itemCommand.Parameters.AddWithValue("$quantity", line.Quantity);
            itemCommand.Parameters.AddWithValue("$unitPrice", line.UnitPrice);
            itemCommand.Parameters.AddWithValue("$lineTotal", line.LineTotal);
            await itemCommand.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();

        return new PlacedOrderResultViewModel
        {
            OrderId = orderId,
            Subtotal = subtotal,
            ShippingFee = shippingFee,
            TaxAmount = taxAmount,
            Total = total
        };
    }

    private async Task<IReadOnlyList<OrderSummaryViewModel>> ReadOrderSummariesAsync(string sql, params (string Name, object Value)[] parameters)
    {
        var orders = new List<OrderSummaryViewModel>();
        await using var connection = await OpenConnectionAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = sql;

        foreach (var parameter in parameters)
        {
            command.Parameters.AddWithValue(parameter.Name, parameter.Value);
        }

        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            orders.Add(new OrderSummaryViewModel
            {
                OrderId = reader.GetInt32(0),
                OrderDateTime = reader.GetString(1),
                OrderTotal = GetDecimal(reader, 2),
                PaymentMethod = reader.GetString(3),
                DeviceType = reader.GetString(4),
                PriorityBucket = reader.GetString(5),
                PriorityScore = reader.IsDBNull(6) ? null : GetDecimal(reader, 6)
            });
        }

        return orders;
    }

    private async Task<Dictionary<int, ProductOptionViewModel>> LoadProductsByIdAsync(
        SqliteConnection connection,
        SqliteTransaction transaction,
        IEnumerable<int> productIds)
    {
        var ids = productIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return [];
        }

        var parameterNames = ids.Select((_, index) => $"$p{index}").ToList();
        var sql = $"""
            SELECT product_id, product_name, category, price
            FROM products
            WHERE is_active = 1 AND product_id IN ({string.Join(", ", parameterNames)});
            """;

        await using var command = connection.CreateCommand();
        command.Transaction = transaction;
        command.CommandText = sql;

        for (var i = 0; i < ids.Count; i++)
        {
            command.Parameters.AddWithValue(parameterNames[i], ids[i]);
        }

        var results = new Dictionary<int, ProductOptionViewModel>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            results[reader.GetInt32(0)] = new ProductOptionViewModel
            {
                ProductId = reader.GetInt32(0),
                ProductName = reader.GetString(1),
                Category = reader.GetString(2),
                Price = GetDecimal(reader, 3)
            };
        }

        return results;
    }

    private async Task<SqliteConnection> OpenConnectionAsync()
    {
        var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }

    private static decimal GetDecimal(SqliteDataReader reader, int ordinal)
        => Convert.ToDecimal(reader.GetDouble(ordinal));
}
