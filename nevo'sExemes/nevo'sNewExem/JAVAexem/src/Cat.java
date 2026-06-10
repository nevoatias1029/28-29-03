public class Cat extends Animal implements Pet {
    private final String name;

    public Cat(String name) {
        super(4);
        this.name = name;
    }

    public Cat() {
        super(4);
        this.name = "unknown";
    }

    @Override
    public String getName() { return name; }

    @Override
    public void setName(String name) {

    }

    @Override
    public void play() {
        System.out.println(name + " is playing with a ball of yarn");
    }

    @Override
    public void eat() {
        System.out.println(name + " is eating cat food");
    }
}
