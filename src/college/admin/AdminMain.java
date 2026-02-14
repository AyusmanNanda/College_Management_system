package college.admin;

import college.libs.ApplicationWindow;

import javax.swing.*;
import java.awt.*;

/**
 * AdminMain is the main dashboard window for Admin.
 *
 * This class extends ApplicationWindow to ensure
 * consistent window behavior and scalability.
 */
public class AdminMain extends ApplicationWindow {

    private Admin admin;
    private AdminProfilePanel profilePanel;

    public AdminMain() {

        admin = new Admin(
                "A001",
                "Default Admin",
                "admin@college.com",
                "9999999999",
                "System Administrator"
        );

        initializeWindow();
    }

    private void initializeWindow() {

        setTitle("Admin Dashboard");

        profilePanel = new AdminProfilePanel(admin);

        // Add content without disturbing ApplicationWindow layout
        getContentPane().add(profilePanel, BorderLayout.CENTER);

        profilePanel.getEditDetailsButton().addActionListener(e ->
                new EditAdminDetailsDialog(this, admin, profilePanel).setVisible(true)
        );
    }
}
