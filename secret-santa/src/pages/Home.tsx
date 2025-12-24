import { createSignal, onMount } from 'solid-js';
import { useAuth } from '../AuthProvider';

const HomePage = () => {
  const auth = useAuth();
  const [greeting, setGreeting] = createSignal('Welcome!');

  onMount(() => {
    if (auth.isAuthenticated && auth.user) {
      setGreeting(`Welcome back, ${auth.user.name || auth.user.email}!`);
    }
  });

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div class="home-page">
      <header>
        <h1>Secret Santa</h1>
        <nav>
          {auth.isAuthenticated ? (
            <>
              <a href="/dashboard">Dashboard</a>
              <a href="/profile">Profile</a>
              <button onClick={auth.logout}>Logout</button>
            </>
          ) : (
            <>
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </>
          )}
        </nav>
      </header>

      <main>
        <section class="hero">
          <h2>{greeting()}</h2>
          <p>Join or create a Secret Santa event with friends and family!</p>

          {auth.isAuthenticated ? (
            <a href="/dashboard" class="cta-button">Go to Dashboard</a>
          ) : (
            <a href="/register" class="cta-button">Get Started</a>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;