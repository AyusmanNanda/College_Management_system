package college.admin;

import college.libs.ApplicationWindow;
import college.libs.UITheme;

import javax.swing.*;
import java.awt.*;

/**
 * EditAdminDetailsDialog allows editing of admin details.
 *
 * Styled to align with CMS theme and spacing.
 */
public class EditAdminDetailsDialog extends JDialog {

    private Admin admin;
    private AdminProfilePanel profilePanel;

    private JTextField nameField;
    private JTextField emailField;
    private JTextField phoneField;
    private JTextField designationField;

    public EditAdminDetailsDialog(ApplicationWindow parent,
                                  Admin admin,
                                  AdminProfilePanel profilePanel) {

        super(parent, "Edit Admin Details", true);

        this.admin = admin;
        this.profilePanel = profilePanel;

        initializeDialog();
    }

    private void initializeDialog() {

        setSize(420, 320);
        setLocationRelativeTo(getParent());

        JPanel rootPanel = new JPanel(new BorderLayout());
        rootPanel.setBackground(UITheme.BACKGROUND_WHITE);
        rootPanel.setBorder(BorderFactory.createEmptyBorder(20, 25, 20, 25));

        JPanel formPanel = new JPanel(new GridLayout(4, 2, 10, 15));
        formPanel.setBackground(UITheme.BACKGROUND_WHITE);

        nameField = createTextField(admin.getName());
        emailField = createTextField(admin.getEmail());
        phoneField = createTextField(admin.getPhone());
        designationField = createTextField(admin.getDesignation());

        formPanel.add(createLabel("Name"));
        formPanel.add(nameField);

        formPanel.add(createLabel("Email"));
        formPanel.add(emailField);

        formPanel.add(createLabel("Phone"));
        formPanel.add(phoneField);

        formPanel.add(createLabel("Designation"));
        formPanel.add(designationField);

        JButton saveButton = new JButton("Save");
        saveButton.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        saveButton.setBackground(UITheme.PRIMARY_BLUE);
        saveButton.setForeground(Color.WHITE);
        saveButton.setFocusPainted(false);

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.setBackground(UITheme.BACKGROUND_WHITE);
        buttonPanel.add(saveButton);

        rootPanel.add(formPanel, BorderLayout.CENTER);
        rootPanel.add(buttonPanel, BorderLayout.SOUTH);

        add(rootPanel);

        saveButton.addActionListener(e -> saveChanges());
    }

    /**
     * Creates styled label.
     */
    private JLabel createLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        return label;
    }

    /**
     * Creates styled text field.
     */
    private JTextField createTextField(String value) {
        JTextField field = new JTextField(value);
        field.setFont(new Font("Segoe UI", Font.PLAIN, 13));
        return field;
    }

    /**
     * Saves updated admin details and refreshes UI.
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
