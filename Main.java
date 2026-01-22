package college.login;

import java.awt.EventQueue;
import javax.swing.JFrame;

class Main {

    public static void main(String[] args) {

        // Ensure Swing UI is created on the Event Dispatch Thread
        EventQueue.invokeLater(() -> {

            JFrame frame = new JFrame("Login");
            frame.setSize(400, 300);
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
            frame.setVisible(true);
        });
    }
}
