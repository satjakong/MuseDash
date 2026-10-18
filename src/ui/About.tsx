import profile1 from '../assets/profile1.png';
import profile2 from '../assets/profile2.png';

export function About() {
  return (
    <div className="about-full-container">
      <div className="about-full-tab">
        <h2>About</h2>
      </div>

      <div className="about-full-content">
        <div className="profiles-wrapper">
          
          <div className="profile-card">
            <div className="profile-img">
              <img src={profile1} alt="Profile 1" />
            </div>
            <div className="profile-info">
              <p><strong>ชื่อ</strong> <br/>นายสัจจา กองรัมย์</p>
              <p><strong>ชื่อเล่น</strong> <br/>เรด</p>
              <p><strong>รหัสนักศึกษา</strong> <br/>1660703156</p>
              <p><strong>หน้าที่</strong> <br/>Develop the project concept and idea<br/>Design the UX/UI<br/>Code the About page and the special page (Search page)</p>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-img">
              <img src={profile2} alt="Profile 2" />
            </div>
            <div className="profile-info">
              <p><strong>ชื่อ</strong> <br/>นายธนวัฒน์ วิเศษชัยวรรณ</p>
              <p><strong>ชื่อเล่น</strong> <br/>คิม</p>
              <p><strong>รหัสนักศึกษา</strong> <br/>1660703990</p>
              <p><strong>หน้าที่</strong> <br/>Code the Home page<br/>Code the Information Details page<br/>Develop the Personal Collection System</p>
            </div>
          </div>

        </div>

        <div className="api-box">
          <h3>API Attribution</h3>
          <p>แอปพลิเคชันนี้ใช้ข้อมูลสื่อมัลติมีเดีย ค้นหาเพลง และเล่นตัวอย่างเสียงจาก <strong>Apple iTunes Search API</strong></p>
          <a 
            href="https://performance-partners.apple.com/search-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="api-link-btn"
          >
            📄 ดูเอกสารประกอบ API
          </a>
        </div>
      </div>
    </div>
  );
}