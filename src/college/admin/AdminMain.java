package college.admin;

import java.awt.Color;
import java.awt.Font;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

/*
 * Temporary Admin main screen.
 * Opens fullscreen and shows "Hello Admin".
 */
public class AdminMain extends JFrame {

    private JPanel contentPane;
    private JLabel titleLabel;

    public AdminMain() {

        setTitle("Admin Panel");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(true);

        contentPane = new JPanel(null);
        contentPane.setBackground(Color.WHITE);
        setContentPane(contentPane);

        titleLabel = new JLabel("Hello Admin");
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 32));
        titleLabel.setForeground(new Color(39, 71, 122));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        contentPane.add(titleLabel);

        // Keep label centered on resize
        addComponentListener(new ComponentAdapter() {
            @Override
            public void componentResized(ComponentEvent e) {
                updateLayout();
            }
        });

        // Start fullscreen (same as LoginPageFrame)
        setExtendedState(JFrame.MAXIMIZED_BOTH);
    }

    private void updateLayout() {
        int width = getWidth();
        int height = getHeight();
        titleLabel.setBounds(0, height / 2 - 20, width, 40);
    }
}
