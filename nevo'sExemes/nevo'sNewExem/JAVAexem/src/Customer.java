import java.util.ArrayList;
import java.util.List;

public class Customer {
    private static int counter = 1;

    private final int id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String deliveryAddress;
    private final CustomerType customerType;
    private final Double discount; // null if not VIP
    private final List<OrderItem> favoriteItems;
    private Gift gift;

    public Customer(String firstName, String lastName, String email,
                    String deliveryAddress, CustomerType customerType, Double discount) {
        this.id = counter++;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.deliveryAddress = deliveryAddress;
        this.customerType = customerType;
        this.discount = discount;
        this.favoriteItems = new ArrayList<>();
        this.gift = null;
    }

    public int getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public CustomerType getCustomerType() { return customerType; }
    public Double getDiscount() { return discount; }
    public List<OrderItem> getFavoriteItems() { return favoriteItems; }
    public Gift getGift() { return gift; }

    public void addItemsToFavorites(List<OrderItem> items) {
        for (OrderItem newItem : items) {
            boolean alreadyExists = false;
            for (OrderItem existing : favoriteItems) {
                if (existing.getName().equalsIgnoreCase(newItem.getName())) {
                    alreadyExists = true;
                    break;
                }
            }
            if (!alreadyExists) {
                favoriteItems.add(newItem);
            }
        }
    }

    public void addFavoriteItem(OrderItem item) {
        for (OrderItem existing : favoriteItems) {
            if (existing.getName().equalsIgnoreCase(item.getName())) {
                System.out.println(item.getName() + " is already in favorites");
                return;
            }
        }
        favoriteItems.add(item);
    }

    public void removeFavoriteItem(String itemName) {
        favoriteItems.removeIf(i -> i.getName().equalsIgnoreCase(itemName));
    }

    public void takeGift(Gift gift) {
        this.gift = gift;
        System.out.println(firstName + " received a gift!");
    }

    public void openMyGift() {
        if (gift != null) {
            gift.openGift();
        } else {
            System.out.println(firstName + " has no gift to open");
        }
    }
}