package college.admin;

import javax.swing.*;
import java.awt.*;

/**
 * Dialog window to edit admin basic details.
 */
public class EditAdminDetailsDialog extends JDialog {

    private Admin admin;
    private AdminProfilePanel profilePanel;

    private JTextField nameField;
    private JTextField emailField;
    private JTextField phoneField;
    private JTextField designationField;

    public EditAdminDetailsDialog(JFrame parent, Admin admin, AdminProfilePanel profilePanel) {
        super(parent, "Edit Admin Details", true);
        this.admin = admin;
        this.profilePanel = profilePanel;

        initializeDialog();
    }

    private void initializeDialog() {

        setSize(400, 300);
        setLocationRelativeTo(getParent());
        setLayout(new GridLayout(5, 2, 10, 10));

        nameField = new JTextField(admin.getName());
        emailField = new JTextField(admin.getEmail());
        phoneField = new JTextField(admin.getPhone());
        designationField = new JTextField(admin.getDesignation());

        JButton saveButton = new JButton("Save");

        add(new JLabel("Name:"));
        add(nameField);
        add(new JLabel("Email:"));
        add(emailField);
        add(new JLabel("Phone:"));
        add(phoneField);
        add(new JLabel("Designation:"));
        add(designationField);
        add(new JLabel());
        add(saveButton);

        saveButton.addActionListener(e -> saveChanges());
    }

    /**
     * Updates admin model and refreshes UI.
     */
    private void saveChanges() {
        admin.setName(nameField.getText());
        admin.setEmail(emailField.getText());
        admin.setPhone(phoneField.getText());
        admin.setDesignation(designationField.getText());

        profilePanel.refreshData();
        dispose();
    }
}
