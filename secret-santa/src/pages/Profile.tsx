import { useAuth } from '../AuthProvider';

const ProfilePage = () => {
  const auth = useAuth();

  return (
    <div class="profile-page">
      <header>
        <h1>Profile</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
          <button onClick={auth.logout}>Logout</button>
        </nav>
      </header>

      <main>
        <section class="profile-info">
          <h2>Your Profile</h2>

          {auth.user ? (
            <div class="user-details">
              <p><strong>Name:</strong> {auth.user.name}</p>
              <p><strong>Email:</strong> {auth.user.email}</p>
              <p><strong>ID:</strong> {auth.user.id}</p>
            </div>
          ) : (
            <p>Loading profile information...</p>
          )}

          <div class="profile-actions">
            <button>Edit Profile</button>
            <button>Change Password</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;