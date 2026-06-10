public class EvenOddThreads {

//    public static void main(String[] args) {
//        Thread oddThread = new Thread(() -> {
//            for (int i = 1; i <= 9; i += 2) {
//                System.out.println("Odd: " + i);
//                try {
//                    Thread.sleep(1000);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//            }
//        });
//
//        Thread evenThread = new Thread(() -> {
//            for (int i = 2; i <= 10; i += 2) {
//                System.out.println("Even: " + i);
//                try {
//                    Thread.sleep(1000);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//            }
//        });
//
//        oddThread.start();
//        evenThread.start();
//    }
}
