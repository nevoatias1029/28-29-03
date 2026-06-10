public class OrderItem {
    private static int counter = 1;

    private final int id;
    private final String name;
    private final double price;

    public OrderItem(String name, double price) {
        this.id = counter++;
        this.name = name;
        this.price = price;
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }

    @Override
    public String toString() {
        return name + " (₪" + price + ")";
    }
}
