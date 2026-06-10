public class Safe {
    private final int code;
    private final String content;
    private String[] contentptions = {"GOLD", "SILVER", "DIAMOND"};
    private Boolean isCracked;

    public Safe(int code) {
        this.code = (int) (Math.random() * 100)+ 1  ;
        this.content = contentptions[(int) (Math.random() * 3)]
        System.out.println("The safe with the " + this.content  + "The safe is  initialized with the code; " + this.code);
    }
    public String getContentByCode(int code){
        if (this.code == code){
            this.isCracked = true;
            return this.content;
        }

    }
}
