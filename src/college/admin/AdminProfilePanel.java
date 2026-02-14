package college.admin;

import javax.swing.*;
import java.awt.*;

/**
 * AdminProfilePanel is responsible only for UI rendering.
 *
 * AdminMain should not contain layout logic.
 * This improves separation of concerns.
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

    /**
     * Initializes UI components and layout.
     */
    private void initializeUI() {

        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(new GridLayout(4, 1, 10, 10));

        nameLabel = new JLabel("Name: " + admin.getName());
        emailLabel = new JLabel("Email: " + admin.getEmail());
        phoneLabel = new JLabel("Phone: " + admin.getPhone());
        designationLabel = new JLabel("Designation: " + admin.getDesignation());

        infoPanel.add(nameLabel);
        infoPanel.add(emailLabel);
        infoPanel.add(phoneLabel);
        infoPanel.add(designationLabel);

        editDetailsButton = new JButton("Edit Details");

        add(infoPanel, BorderLayout.CENTER);
        add(editDetailsButton, BorderLayout.SOUTH);
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
