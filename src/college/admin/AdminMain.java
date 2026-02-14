package college.admin;

import javax.swing.*;

/**
 * AdminMain acts as controller and frame holder.
 *
 * UI logic is delegated to AdminProfilePanel.
 */
public class AdminMain extends JFrame {

    private Admin admin;
    private AdminProfilePanel profilePanel;

    public AdminMain() {

        // Temporary dummy data (later connect to AdminData)
        admin = new Admin(
                "A001",
                "Default Admin",
                "admin@college.com",
                "9999999999",
                "System Administrator"
        );

        initializeFrame();
    }

    /**
     * Initializes main frame settings.
     */
    private void initializeFrame() {

        setTitle("Admin Dashboard");
        setSize(600, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        profilePanel = new AdminProfilePanel(admin);

        add(profilePanel);

        setVisible(true);
    }
}
