using LibraryClasses.Data.DataDto;
using LibraryClasses.Data.ShopDb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;

namespace Server.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class DescriptionsController : ControllerBase {
        private readonly ApplicationDbContext _context;

        public DescriptionsController (ApplicationDbContext context) {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDescriptions () {
            return Ok(_context.Description.ToList());
        }
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public IActionResult AddDescription ([FromBody] DiscriptionDto dto) {
            var description = new Description {
                Name = dto.Name
            };

            _context.Description.Add(description);
            _context.SaveChanges();

            return Ok(description);
        }
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteDescription (int id) {
            var desc = _context.Description.Find(id);
            if (desc == null) return NotFound();
            _context.Description.Remove(desc);
            _context.SaveChanges();
            return NoContent();
        }

    }
}
