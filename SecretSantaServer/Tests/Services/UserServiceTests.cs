using SecretSantaServer.Services;
using Xunit;

namespace Tests.Services;

public class UserServiceTests
{
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _userService = new UserService();
    }
}