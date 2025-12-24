import { useAuth } from '../AuthProvider';

const DashboardPage = () => {
  const auth = useAuth();

  return (
    <div class="dashboard-page">
      <header>
        <h1>Dashboard</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/profile">Profile</a>
          <button onClick={auth.logout}>Logout</button>
        </nav>
      </header>

      <main>
        <section class="user-info">
          <h2>Hello, {auth.user?.name || auth.user?.email}!</h2>
          <p>Welcome to your Secret Santa dashboard.</p>
        </section>

        <section class="dashboard-actions">
          <div class="action-card">
            <h3>Create Event</h3>
            <p>Start a new Secret Santa event</p>
            <button>Create Event</button>
          </div>

          <div class="action-card">
            <h3>Join Event</h3>
            <p>Join an existing Secret Santa event</p>
            <button>Join Event</button>
          </div>

          <div class="action-card">
            <h3>Your Events</h3>
            <p>Manage your Secret Santa events</p>
            <button>View Events</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;