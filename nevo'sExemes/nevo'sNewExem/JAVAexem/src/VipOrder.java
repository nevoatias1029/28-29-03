import java.util.List;

public class VipOrder extends Order {

    private final Customer vipCustomer;

    public VipOrder(String name, String deliveryAddress, List<OrderItem> items,
                    Customer customer, PaymentType paymentType) {
        super(name, deliveryAddress, items, customer, paymentType);
        this.vipCustomer = customer;
    }

    public double getDiscountedTotal() {
        if (vipCustomer.getCustomerType() != CustomerType.VIP) {
            throw new IllegalArgumentException("Cannot create a VIP order for a non-VIP customer!");
        }

        // sum total
        double total = 0;
        for (OrderItem item : getItems()) {
            total += item.getPrice();
        }

        // sum with dicount
        Double discount = vipCustomer.getDiscount();
        if (discount != null) {
            total = total - (total * discount / 100);
        }

        return total;
    }
}
