package college.admin;

import college.libs.UITheme;

import javax.swing.*;
import java.awt.*;

/**
 * AdminProfilePanel is responsible for displaying
 * admin information inside the dashboard.
 *
 * This version aligns with CMS theme and improves spacing.
 */
public class AdminProfilePanel extends JPanel {

    private Admin admin;

    private JLabel nameLabel;
    private JLabel emailLabel;
    private JLabel phoneLabel;
    private JLabel designationLabel;

    private JButton editDetailsButton;

    public AdminProfilePanel(Admin admin) {
        this.admin = admin;
        initializeUI();
    }

    private void initializeUI() {

        setLayout(new BorderLayout());
        setBackground(UITheme.BACKGROUND_WHITE);

        // Container panel with padding
        JPanel container = new JPanel();
        container.setLayout(new GridLayout(5, 1, 0, 12));
        container.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        container.setBackground(UITheme.BACKGROUND_WHITE);

        nameLabel = createInfoLabel("Name: " + admin.getName());
        emailLabel = createInfoLabel("Email: " + admin.getEmail());
        phoneLabel = createInfoLabel("Phone: " + admin.getPhone());
        designationLabel = createInfoLabel("Designation: " + admin.getDesignation());

        editDetailsButton = new JButton("Edit Details");
        editDetailsButton.setFont(new Font("Segoe UI", Font.PLAIN, 13));

        container.add(nameLabel);
        container.add(emailLabel);
        container.add(phoneLabel);
        container.add(designationLabel);
        container.add(editDetailsButton);

        add(container, BorderLayout.NORTH);
    }

    /**
     * Creates a styled label for displaying admin information.
     */
    private JLabel createInfoLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        return label;
    }

    public JButton getEditDetailsButton() {
        return editDetailsButton;
    }

    /**
     * Refresh UI when admin data changes.
     */
    public void refreshData() {
        nameLabel.setText("Name: " + admin.getName());
        emailLabel.setText("Email: " + admin.getEmail());
        phoneLabel.setText("Phone: " + admin.getPhone());
        designationLabel.setText("Designation: " + admin.getDesignation());
    }
}
