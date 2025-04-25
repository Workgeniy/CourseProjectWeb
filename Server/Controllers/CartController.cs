using LibraryClasses.Data.ShopDb;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Server.Data.ShopDb;
using Server.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LibraryClasses.Data.DataDto;

namespace Server.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase {
        private readonly ApplicationDbContext _context;

        public CartController (ApplicationDbContext context) {
            _context = context;
        }

        private string GetUserId () =>
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        [HttpGet]
        public async Task<IActionResult> GetCart () {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId);

            if (cart == null)
                return Ok(new { items = new List<object>() });

            var result = new {
                items = cart.Items.Select(i => new {
                    itemId = i.Id,
                    productId = i.ProductId,
                    productName = i.Product?.Name,
                    quantity = i.Quantity,
                    price = i.Product?.Price ?? 0
                })
            };

            return Ok(result);
        }


        [HttpPost("add")]
        public async Task<IActionResult> AddToCart ([FromBody] AddToCartDto dto) {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId);

            if (cart == null) {
                cart = new Cart { ApplicationUserId = userId, Items = new List<CartItem>() };
                _context.Carts.Add(cart);
            }

            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null)
                return NotFound("Товар не найден");

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
            int totalRequested = (existingItem?.Quantity ?? 0) + dto.Quantity;

            if (totalRequested > product.Quantity)
                return BadRequest($"Нельзя добавить больше {product.Quantity} шт. в корзину");

            if (existingItem != null)
                existingItem.Quantity += dto.Quantity;
            else
                cart.Items.Add(new CartItem { ProductId = dto.ProductId, Quantity = dto.Quantity });

            await _context.SaveChangesAsync();
            return Ok("Добавлено в корзину");
        }



        [HttpDelete("remove/{itemId}")]
        public async Task<IActionResult> RemoveFromCart (int itemId) {
            var item = await _context.CartItems.FindAsync(itemId);
            if (item == null) return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Удалено из корзины");
        }

        [HttpPost("decrease")]
        public async Task<IActionResult> DecreaseQuantity ([FromBody] AddToCartDto dto) {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId);

            if (cart == null)
                return NotFound("Корзина не найдена");

            var item = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
            if (item == null)
                return NotFound("Товар не найден в корзине");

            item.Quantity--;

            if (item.Quantity <= 0)
                _context.CartItems.Remove(item);

            await _context.SaveChangesAsync();
            return Ok("Количество уменьшено");
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart () {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId);

            if (cart == null) return NotFound("Корзина не найдена");

            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();

            return Ok("Корзина очищена");
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout () {
            var userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == userId);

            if (cart == null || !cart.Items.Any())
                return BadRequest("Корзина пуста");

            foreach (var item in cart.Items) {
                var product = item.Product;

                if (product == null)
                    return BadRequest($"Товар с ID {item.ProductId} не найден");

                if (item.Quantity > product.Quantity)
                    return BadRequest($"Недостаточно товара: {product.Name}");

                // Вычитаем из наличия
                product.Quantity -= item.Quantity;

                // Если товара больше нет, удаляем из базы
                if (product.Quantity == 0) {
                    _context.Products.Remove(product);
                }
            }

            // Очищаем корзину
            _context.CartItems.RemoveRange(cart.Items);

            await _context.SaveChangesAsync();
            return Ok("Покупка успешно оформлена");
        }


    }

}
