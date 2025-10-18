import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt cho medical chatbot
const SYSTEM_PROMPT = `Bạn là trợ lý y tế AI của ứng dụng đặt lịch khám bác sĩ tại Việt Nam.

NHIỆM VỤ CỦA BẠN:
1. Tư vấn về các triệu chứng bệnh cơ bản
2. Gợi ý chuyên khoa phù hợp để khám
3. Hướng dẫn cách đặt lịch hẹn với bác sĩ
4. Trả lời các câu hỏi về sức khỏe

NGUYÊN TẮC QUAN TRỌNG:
- LUÔN trả lời bằng tiếng Việt
- KHÔNG chẩn đoán bệnh chính xác hoặc kê đơn thuốc
- LUÔN khuyến nghị gặp bác sĩ nếu triệu chứng nghiêm trọng hoặc kéo dài
- Thân thiện, lịch sự và chuyên nghiệp
- Trả lời ngắn gọn, súc tích (2-4 câu)
- Khuyến khích đặt lịch khám khi cần thiết
- Gợi ý chuyên khoa cụ thể (Nội khoa, Tim mạch, Thần kinh, Tiêu hóa, v.v.)

VÍ DỤ CÂU TRẢ LỜI TỐT:
User: "Tôi bị đau đầu"
Bot: "Đau đầu có thể do nhiều nguyên nhân như căng thẳng, mất ngủ, hoặc vấn đề sức khỏe nghiêm trọng hơn. Nếu đau đầu kéo dài hoặc dữ dội, tôi khuyên bạn nên đặt lịch khám với bác sĩ **Nội khoa** hoặc **Thần kinh** để được thăm khám kỹ hơn."

User: "Làm thế nào để đặt lịch?"
Bot: "Để đặt lịch khám:\n1. Vào trang chủ và chọn bác sĩ phù hợp\n2. Xem lịch làm việc và chọn khung giờ\n3. Nhập thông tin và xác nhận\n\nBạn cần hỗ trợ gì thêm không?"`;

// Knowledge base cho các câu hỏi nhanh
const MEDICAL_KNOWLEDGE = {
  symptoms: {
    'đau đầu': 'Đau đầu có thể do nhiều nguyên nhân như căng thẳng, mất ngủ, hoặc vấn đề sức khỏe. Tôi khuyên bạn nên đặt lịch khám với bác sĩ **Nội khoa** hoặc **Thần kinh** để được khám kỹ hơn.',
    'sốt': 'Sốt thường là dấu hiệu cơ thể đang chống lại nhiễm trùng. Nếu sốt cao trên 39°C hoặc kéo dài trên 3 ngày, bạn nên gặp bác sĩ **Nội khoa** ngay.',
    'ho': 'Ho có thể do cảm lạnh, dị ứng, hoặc nhiễm trùng đường hô hấp. Nếu ho kéo dài hoặc ra máu, hãy đặt lịch với bác sĩ **Hô hấp** hoặc **Nội khoa**.',
    'đau bụng': 'Đau bụng có nhiều nguyên nhân khác nhau. Nếu đau dữ dội hoặc kéo dài, bạn nên khám với bác sĩ **Tiêu hóa** hoặc **Nội khoa**.',
    'đau tim': 'Đau ngực hoặc đau tim cần được xử lý khẩn cấp. Hãy gọi cấp cứu hoặc đến bệnh viện ngay. Sau đó, đặt lịch với bác sĩ **Tim mạch**.',
    'đau răng': 'Đau răng cần được khám bởi bác sĩ **Răng hàm mặt**. Tạm thời bạn có thể súc miệng nước muối ấm để giảm đau.',
    'chóng mặt': 'Chóng mặt có thể do huyết áp thấp, thiếu máu, hoặc vấn đề tai trong. Hãy khám với bác sĩ **Nội khoa** hoặc **Tai mũi họng**.',
  },
  appointment: {
    'đặt lịch': 'Để đặt lịch khám:\n1. Vào trang chủ và chọn bác sĩ phù hợp\n2. Xem lịch làm việc và chọn khung giờ\n3. Nhập thông tin cá nhân\n4. Xác nhận và hoàn tất\n\nBạn cần hỗ trợ thêm không?',
    'hủy lịch': 'Để hủy lịch hẹn, vào phần **Lịch hẹn của tôi** trong menu và chọn nút Hủy. Lưu ý: Nên hủy ít nhất 24h trước giờ hẹn.',
    'thay đổi lịch': 'Hiện tại bạn cần hủy lịch cũ và đặt lịch mới. Vào **Lịch hẹn của tôi** để hủy, sau đó đặt lịch mới.',
  }
};

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Bước 1: Kiểm tra FAQ database trước (nhanh hơn, tiết kiệm API calls)
    const { data: faq } = await supabase
      .from('faq')
      .select('answer')
      .ilike('question', `%${message}%`)
      .single();

    if (faq) {
      return NextResponse.json({ reply: faq.answer });
    }

    // Bước 2: Xử lý keywords đặc biệt (thông tin về bác sĩ, chuyên khoa)
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('chuyên khoa')) {
      const { data: doctors } = await supabase
        .from('doctors')
        .select('specialty');

      if (doctors && doctors.length > 0) {
        const specialties = [...new Set(doctors.map(d => d.specialty).filter(Boolean))];
        const reply = `Chúng tôi có các chuyên khoa sau: ${specialties.join(', ')}. Bạn quan tâm đến chuyên khoa nào?`;
        return NextResponse.json({ reply });
      }
    }
    
    if (lowerCaseMessage.includes('danh sách bác sĩ') || lowerCaseMessage.includes('bác sĩ nào')) {
      const { data: doctors } = await supabase
        .from('doctors')
        .select('name, specialty');

      if (doctors && doctors.length > 0) {
        const doctorList = doctors
          .slice(0, 5) // Giới hạn 5 bác sĩ đầu tiên
          .map(d => `${d.name} (${d.specialty || 'Đa khoa'})`)
          .join(', ');
        const reply = `Một số bác sĩ tiêu biểu: ${doctorList}. Bạn có thể xem danh sách đầy đủ trên trang chủ.`;
        return NextResponse.json({ reply });
      }
    }

    // Bước 3: Xử lý triệu chứng bệnh (knowledge base nhanh)
    for (const [symptom, advice] of Object.entries(MEDICAL_KNOWLEDGE.symptoms)) {
      if (lowerCaseMessage.includes(symptom)) {
        return NextResponse.json({ reply: advice });
      }
    }

    // Bước 4: Xử lý câu hỏi về đặt lịch
    for (const [keyword, guide] of Object.entries(MEDICAL_KNOWLEDGE.appointment)) {
      if (lowerCaseMessage.includes(keyword)) {
        return NextResponse.json({ reply: guide });
      }
    }

    // Bước 5: Sử dụng Gemini AI cho các câu hỏi phức tạp hơn
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }],
          },
          {
            role: 'model',
            parts: [{ text: 'Được rồi, tôi hiểu. Tôi sẽ hỗ trợ người dùng với vai trò là trợ lý y tế AI chuyên nghiệp, trả lời bằng tiếng Việt và luôn khuyến khích đặt lịch khám khi cần thiết.' }],
          },
        ],
      });

      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text();

      return NextResponse.json({ reply: aiResponse });

    } catch (aiError) {
      console.error('Gemini AI Error:', aiError);
      
      // Fallback nếu AI lỗi
      return NextResponse.json({ 
        reply: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về:\n• Các triệu chứng (đau đầu, sốt, ho...)\n• Chuyên khoa và bác sĩ\n• Cách đặt lịch khám\n\nHoặc gọi hotline: 1900-xxxx để được hỗ trợ trực tiếp." 
      });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' 
    }, { status: 500 });
  }
}
