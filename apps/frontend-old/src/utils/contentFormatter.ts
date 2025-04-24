/**
 * Hàm định dạng nội dung sản phẩm, tự động thêm các thẻ h2 cho các đoạn văn bản
 * @param content Nội dung sản phẩm
 * @returns Nội dung đã được định dạng với các thẻ h2
 */
export function formatProductContent(content: string): string {
  if (!content) return '';

  // Kiểm tra xem nội dung đã có thẻ h2 chưa
  const hasH2Tags = /<h2[^>]*>.*?<\/h2>/i.test(content);
  
  // Nếu đã có thẻ h2, trả về nội dung gốc
  if (hasH2Tags) {
    return content;
  }
  
  // Tách nội dung thành các đoạn
  const paragraphs = content.split(/\n\s*\n/);
  
  // Nếu chỉ có một đoạn, trả về nội dung gốc
  if (paragraphs.length <= 1) {
    return `<p>${content}</p>`;
  }
  
  // Xử lý các đoạn văn bản
  let formattedContent = '';
  let currentSection = '';
  
  paragraphs.forEach((paragraph, index) => {
    // Bỏ qua các đoạn trống
    if (!paragraph.trim()) return;
    
    // Nếu đoạn văn bản ngắn (dưới 100 ký tự) và không kết thúc bằng dấu chấm, 
    // có thể đây là tiêu đề
    const isPotentialHeading = paragraph.trim().length < 100 && 
                              !paragraph.trim().endsWith('.') &&
                              !paragraph.trim().endsWith('?') &&
                              !paragraph.trim().endsWith('!');
    
    // Nếu là đoạn đầu tiên, xử lý đặc biệt
    if (index === 0) {
      // Đoạn đầu tiên có thể là giới thiệu
      formattedContent += `<p>${paragraph.trim()}</p>\n\n`;
      return;
    }
    
    // Nếu là tiêu đề tiềm năng
    if (isPotentialHeading) {
      // Thêm đoạn trước đó vào nội dung
      if (currentSection) {
        formattedContent += currentSection;
        currentSection = '';
      }
      
      // Thêm tiêu đề mới
      formattedContent += `<h2>${paragraph.trim()}</h2>\n`;
    } else {
      // Nếu không phải tiêu đề, thêm vào đoạn hiện tại
      currentSection += `<p>${paragraph.trim()}</p>\n`;
    }
  });
  
  // Thêm đoạn cuối cùng vào nội dung
  if (currentSection) {
    formattedContent += currentSection;
  }
  
  return formattedContent;
}

/**
 * Hàm tạo ID từ text cho các thẻ heading
 * @param text Nội dung text
 * @returns ID được tạo từ text
 */
export function createIdFromText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/--+/g, '-') // Loại bỏ nhiều dấu gạch ngang liên tiếp
    .trim();
}

/**
 * Hàm thêm ID cho các thẻ heading trong nội dung HTML
 * @param htmlContent Nội dung HTML
 * @returns Nội dung HTML với ID cho các thẻ heading
 */
export function addIdsToHeadings(htmlContent: string): string {
  if (!htmlContent) return '';
  
  // Thêm ID cho các thẻ h2
  return htmlContent.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, text) => {
    const id = createIdFromText(text);
    return `<h2 id="${id}">${text}</h2>`;
  });
}

/**
 * Hàm định dạng đầy đủ nội dung sản phẩm
 * @param content Nội dung sản phẩm
 * @returns Nội dung đã được định dạng đầy đủ
 */
export function formatFullProductContent(content: string): string {
  if (!content) return '';
  
  // Định dạng nội dung và thêm ID cho các thẻ heading
  const formattedContent = formatProductContent(content);
  return addIdsToHeadings(formattedContent);
}

export function formatFullPostContent(content: string): string {
  if (!content) return '';

  // Tách nội dung thành các đoạn
  const paragraphs = content.split('\n\n');

  // Xử lý từng đoạn
  const formattedParagraphs = paragraphs.map((paragraph, index) => {
    // Nếu đoạn bắt đầu bằng "##" hoặc "# ", coi như đó là heading
    if (paragraph.startsWith('##') || paragraph.startsWith('# ')) {
      const headingText = paragraph.replace(/^#+\s/, '');
      const headingId = `heading-${index}`;
      return `<h2 id="${headingId}">${headingText}</h2>`;
    }

    // Xử lý các đoạn văn bản thông thường
    return `<p>${paragraph}</p>`;
  });

  return formattedParagraphs.join('\n');
} 