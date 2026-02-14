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
    /**
     * Creates top header panel for dashboard.
     */
    private JPanel createHeaderPanel() {

        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(10, 20, 10, 20));

        JLabel titleLabel = new JLabel("Admin Dashboard");
        titleLabel.setFont(new Font("SansSerif", Font.BOLD, 18));

        panel.add(titleLabel, BorderLayout.WEST);

        return panel;
    }


    private void initializeWindow() {

        setTitle("Admin");

        // Root container using BorderLayout (standard CMS structure)
        JPanel rootPanel = new JPanel(new BorderLayout());

        // Maintain standard padding used across CMS
        rootPanel.setBorder(BorderFactory.createEmptyBorder(15, 20, 15, 20));

        // Profile panel (main content)
        profilePanel = new AdminProfilePanel(admin);

        rootPanel.add(profilePanel, BorderLayout.CENTER);

        // Add root panel to ApplicationWindow
        getContentPane().add(rootPanel, BorderLayout.CENTER);

        // Attach edit button listener
        profilePanel.getEditDetailsButton().addActionListener(e ->
                new EditAdminDetailsDialog(this, admin, profilePanel).setVisible(true)
        );
    }


}
