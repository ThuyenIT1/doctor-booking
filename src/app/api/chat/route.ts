import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Step 1: Search in FAQ table
    // We use ilike for case-insensitive search. The `%` are wildcards.
    const { data: faq, error: faqError } = await supabase
      .from('faq')
      .select('answer')
      .ilike('question', `%${message}%`)
      .single();

    if (faq) {
      return NextResponse.json({ reply: faq.answer });
    }

    // Step 2: Check for keywords if no FAQ found
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes('chuyên khoa')) {
      const { data: doctors, error: doctorError } = await supabase
        .from('doctors')
        .select('specialty');

      if (doctors) {
        const specialties = [...new Set(doctors.map(d => d.specialty))];
        const reply = `Chúng tôi có các chuyên khoa sau: ${specialties.join(', ')}. Bạn quan tâm đến chuyên khoa nào?`;
        return NextResponse.json({ reply });
      }
    }
    
    if (lowerCaseMessage.includes('danh sách bác sĩ')) {
        const { data: doctors, error: doctorError } = await supabase
          .from('doctors')
          .select('name');
  
        if (doctors) {
          const doc_name = [...new Set(doctors.map(d => d.name))];
          const reply = `Chúng tôi có các bác sĩ sau: ${doc_name.join(', ')}. Bạn quan tâm đến bác sĩ nào?`;
          return NextResponse.json({ reply });
        }
      }

    // Step 3: Default fallback message
    return NextResponse.json({ reply: "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể vui lòng hỏi một câu hỏi khác không?" });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
