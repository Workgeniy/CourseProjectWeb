using LibraryClasses.Data.DataDto;
using LibraryClasses.Data.ShopDb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;

namespace Server.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase {
        private readonly ApplicationDbContext _context;

        public CategoriesController (ApplicationDbContext context) {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetCategories () {
            return Ok(_context.Categories.ToList());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AddCategory ([FromBody] CategoryDto dto) {
            var category = new Category {
                Name = dto.Name
            };

            _context.Categories.Add(category);
            _context.SaveChanges();

            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteCategory (int id) {
            var category = _context.Categories.Find(id);
            if (category == null) return NotFound();
            _context.Categories.Remove(category);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
