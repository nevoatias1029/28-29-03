import java.util.Arrays;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        // customers
        Customer regularCustomer = new Customer(
                "Yossi", "Cohen", "yossi@gmail.com",
                "Tel Aviv", CustomerType.REGULAR, null
        );

        Customer vipCustomer = new Customer(
                "Dana", "Levi", "dana@gmail.com",
                "Haifa", CustomerType.VIP, 20.0
        );

        // items
        OrderItem item1 = new OrderItem("Pizza", 50.0);
        OrderItem item2 = new OrderItem("Cola", 10.0);
        OrderItem item3 = new OrderItem("Burger", 45.0);

        // regularOrder
        List<OrderItem> items1 = Arrays.asList(item1, item2);
        Order regularOrder = new Order(
                "Yossi's Order", "Tel Aviv",
                items1, regularCustomer, PaymentType.CREDIT_CARD
        );
        System.out.println(regularOrder);

        // vipOrder
        List<OrderItem> items2 = Arrays.asList(item2, item3);
        VipOrder vipOrder = new VipOrder(
                "Dana's VIP Order", "Haifa",
                items2, vipCustomer, PaymentType.CASH
        );
        System.out.println("VIP total with discount: $" + vipOrder.getDiscountedTotal());

        // gift
        Gift gift = new SimpleGift();
        regularCustomer.takeGift(gift);
        regularCustomer.openMyGift();

        // favorites
        System.out.println("Yossi's favorites: " + regularCustomer.getFavoriteItems());

        // error test
        try {
            VipOrder badOrder = new VipOrder(
                    "Bad Order", "Jerusalem",
                    items1, regularCustomer, PaymentType.CHECK
            );
            System.out.println(badOrder.getDiscountedTotal());
        } catch (IllegalArgumentException e) {
            System.out.println("Error caught: " + e.getMessage());
        }
        // --- Bonus ---
        Cat cat = new Cat("Whiskers");
        cat.eat();
        cat.walk();
        cat.play();

        Fish fish = new Fish();
        fish.setName("Nemo");
        fish.eat();
        fish.walk();
        fish.play();

        Spider spider = new Spider();
        spider.eat();
        spider.walk();

    }
}

