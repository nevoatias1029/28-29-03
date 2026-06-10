import java.time.LocalDate;
import java.util.List;

public class Order {
    private static int counter = 1;

    private final int id;
    private final String name;
    private final String deliveryAddress;
    private final List<OrderItem> items;
    private final Customer customer;
    private final double totalPrice;
    private final PaymentType paymentType;
    private final LocalDate orderDate;

    public Order(String name, String deliveryAddress, List<OrderItem> items,
                 Customer customer, PaymentType paymentType) {
        this.id = counter++;
        this.name = name;
        this.deliveryAddress = deliveryAddress;
        this.items = items;
        this.customer = customer;
        this.paymentType = paymentType;
        this.orderDate = LocalDate.now();
        this.totalPrice = calculateTotalPrice();

        // auto-add items to customer favorites
        customer.addItemsToFavorites(items);
    }

    protected double calculateTotalPrice() {
        double total = 0;
        for (OrderItem item : items) {
            total += item.getPrice();
        }
        return total;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public List<OrderItem> getItems() { return items; }
    public Customer getCustomer() { return customer; }
    public double getTotalPrice() { return totalPrice; }
    public PaymentType getPaymentType() { return paymentType; }
    public LocalDate getOrderDate() { return orderDate; }

    @Override
    public String toString() {
        return "Order #" + id + " | " + name + " | Total: ₪" + totalPrice
                + " | Payment: " + paymentType + " | Date: " + orderDate;
    }
}
