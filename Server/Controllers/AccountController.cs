using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LibraryClasses.Data.Account;
using Server.Data.ShopDb;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Server.Controllers {
    [ApiController]
    [Route("api/account")]
    public class AccountController : ControllerBase {
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;
        private readonly IConfiguration configuration;

        public AccountController (
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration) {
            this.userManager = userManager;
            this.signInManager = signInManager;
            this.configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register ([FromBody] RegisterModel model) {
            if (model.Password != model.ConfirmPassword)
                return BadRequest("Пароли не совпадают");

            var user = new ApplicationUser {
                UserName = model.Login,
                Email = model.Email,
            };

            var result = await userManager.CreateAsync(user, model.Password);
            if (result.Succeeded) {
                var accessToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                return Ok(new {
                    accessToken,
                    refreshToken,
                    user = new {
                        id = user.Id,
                        email = user.Email,
                        userName = user.UserName,
                        roles = await userManager.GetRolesAsync(user)
                    }
                });
            }

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login ([FromBody] LoginModel model) {
            var user = await userManager.FindByEmailAsync(model.Email);
            if (user != null && await userManager.CheckPasswordAsync(user, model.Password)) {
                var accessToken = await GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                return Ok(new {
                    accessToken,
                    refreshToken,
                    user = new {
                        id = user.Id,
                        email = user.Email,
                        userName = user.UserName,
                        roles = await userManager.GetRolesAsync(user)
                    }
                });
            }

            return Unauthorized("Неверный email или пароль");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken ([FromBody] RefreshRequest request) {
            var principal = GetPrincipalFromExpiredToken(request.Token);

            if (principal == null)
                return BadRequest("Невалидный токен");

            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            var user = await userManager.FindByEmailAsync(email);

            if (user == null)
                return Unauthorized();

            var newAccessToken = await GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();

            return Ok(new {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers () {
            var users = userManager.Users.ToList();
            var userList = new List<object>();

            foreach (var user in users) {
                var roles = await userManager.GetRolesAsync(user);
                userList.Add(new {
                    id = user.Id,
                    email = user.Email,
                    userName = user.UserName,
                    role = (await userManager.GetRolesAsync(user)).FirstOrDefault()
                });
            }

            return Ok(userList);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("change-role")]
        public async Task<IActionResult> ChangeRole ([FromBody] ChangeModel model) {
            var user = await userManager.FindByIdAsync(model.UserId);
            if (user == null) return NotFound();

            var currentRoles = await userManager.GetRolesAsync(user);
            await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRoleAsync(user, model.NewRole);

            return Ok("Роль обновлена");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser (string id) {
            var user = await userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            await userManager.DeleteAsync(user);
            return Ok("Пользователь удалён");
        }

        // JWT Token
        private async Task<string> GenerateJwtToken (ApplicationUser user) {
            var roles = await userManager.GetRolesAsync(user);

            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName)
            };

            foreach (var role in roles) {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken (string token) {
            var tokenValidationParameters = new TokenValidationParameters {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = false,
                ValidIssuer = configuration["Jwt:Issuer"],
                ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            try {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken validatedToken);
                return principal;
            }
            catch {
                return null;
            }
        }

        private string GenerateRefreshToken () {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public class RefreshRequest {
            public string Token { get; set; }
        }
    }
}
