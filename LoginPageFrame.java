package college.login;

import java.awt.EventQueue;
import javax.swing.JFrame;

class LoginPageFrame extends JFrame {

    LoginPageFrame() {
        // Configure the main login window
        setTitle("Login");
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    }

    public static void main(String[] args) {

        // Start UI creation on the Event Dispatch Thread
        EventQueue.invokeLater(() -> {
            LoginPageFrame frame = new LoginPageFrame();
            frame.setVisible(true);
        });
    }
}
