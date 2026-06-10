public class Fish extends Animal implements Pet {
    private String name;

    public Fish() {
        super(0);
        this.name = "unknown";
    }

    @Override
    public String getName() { return name; }

    @Override
    public void setName(String name) { this.name = name; }

    @Override
    public void play() {
        System.out.println(name + " is swimming around");
    }

    @Override
    public void walk() {
        System.out.println(name + " can't walk, it's a fish!");
    }

    @Override
    public void eat() {
        System.out.println(name + " is eating fish flakes");
    }
}