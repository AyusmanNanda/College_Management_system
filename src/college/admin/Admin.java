package college.admin;

/**
 * Represents admin data mapped directly from
 * the admin table in the database.
 *
 * This class is a pure data holder (POJO).
 */
public class Admin {

    private String collagename;
    private String address;
    private String emailid;
    private String contactnumber;
    private String website;
    private String lastlogin;
    private String facebook;
    private String instagram;
    private String twitter;
    private String linkedin;
    private boolean activestatus;

    public Admin(String collagename,
                 String address,
                 String emailid,
                 String contactnumber,
                 String website,
                 String lastlogin,
                 String facebook,
                 String instagram,
                 String twitter,
                 String linkedin,
                 boolean activestatus) {

        this.collagename = collagename;
        this.address = address;
        this.emailid = emailid;
        this.contactnumber = contactnumber;
        this.website = website;
        this.lastlogin = lastlogin;
        this.facebook = facebook;
        this.instagram = instagram;
        this.twitter = twitter;
        this.linkedin = linkedin;
        this.activestatus = activestatus;
    }

    public String getCollagename() { return collagename; }
    public String getAddress() { return address; }
    public String getEmailid() { return emailid; }
    public String getContactnumber() { return contactnumber; }
    public String getWebsite() { return website; }
    public String getLastlogin() { return lastlogin; }
    public String getFacebook() { return facebook; }
    public String getInstagram() { return instagram; }
    public String getTwitter() { return twitter; }
    public String getLinkedin() { return linkedin; }
    public boolean isActivestatus() { return activestatus; }

    public void setCollagename(String collagename) {
        this.collagename = collagename;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setEmailid(String emailid) {
        this.emailid = emailid;
    }

    public void setContactnumber(String contactnumber) {
        this.contactnumber = contactnumber;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

}

