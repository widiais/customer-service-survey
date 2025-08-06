# 🚨 Mandatory Questions Feature

## 📋 Overview

Fitur **Mandatory Questions** memungkinkan admin untuk menandai pertanyaan tertentu dalam grup pertanyaan sebagai **wajib diisi** saat survey. Pertanyaan mandatory harus dijawab sebelum responden dapat melanjutkan ke section berikutnya atau menyelesaikan survey.

## ✨ Features

### **1. 🏗️ Question Group Management**
- ✅ **Checkbox Mandatory** - Setiap pertanyaan dalam grup memiliki checkbox "Wajib"
- ✅ **Visual Indicators** - Badge "Wajib" muncul untuk pertanyaan mandatory
- ✅ **Smart Selection** - Checkbox mandatory hanya muncul untuk pertanyaan yang dipilih
- ✅ **Auto Cleanup** - Menghapus pertanyaan dari mandatory list saat pertanyaan dihapus dari grup

### **2. 📝 Survey Experience**
- ✅ **Visual Indicators** - Pertanyaan mandatory ditandai dengan `*` merah
- ✅ **Section Validation** - Validasi saat "Next" untuk pertanyaan mandatory di section saat ini
- ✅ **Final Validation** - Validasi komprehensif saat submit survey
- ✅ **Clear Error Messages** - Pesan error yang jelas menunjukkan pertanyaan mana yang belum dijawab

### **3. 🔧 Technical Implementation**
- ✅ **Database Schema** - Field `mandatoryQuestionIds` di QuestionGroup
- ✅ **Type Safety** - TypeScript interfaces terupdate
- ✅ **Backward Compatibility** - Optional field, tidak break existing data

---

## 🏗️ **Database Schema Changes**

### **QuestionGroup Interface**
```typescript
export interface QuestionGroup {
  id: string;
  name: string;
  description?: string;
  questionIds: string[]; // Array of question IDs
  mandatoryQuestionIds?: string[]; // ✨ NEW: Array of mandatory question IDs
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎯 **User Experience Flow**

### **📝 Creating Question Group**

#### **Before (No Mandatory Control):**
```
┌─ Question Selection ─────────────────┐
│ ☑️ Domisili                         │
│ ☑️ Social Media yang sering digunakan│
│ ☑️ Nomor Whatsapp                   │
│ ☑️ Jenis Kelamin                    │
└─────────────────────────────────────┘
```

#### **After (With Mandatory Control):**
```
┌─ Question Selection ─────────────────┐
│ ☑️ Domisili                    ☑️ Wajib│
│ ☑️ Social Media...            ☐ Wajib│
│ ☑️ Nomor Whatsapp             ☑️ Wajib│
│ ☑️ Jenis Kelamin              ☐ Wajib│
└─────────────────────────────────────┘
```

### **🔍 Survey Taking Experience**

#### **Question Display:**
```
Basic Information • Pilihan Ganda

Domisili *                    ← Red asterisk for mandatory
○ Kab Bandung
○ Kota Bandung  
○ Cimahi
○ Sumedang

Social Media yang sering digunakan
○ Instagram
○ Facebook
○ X / Twitter
○ Thread
○ Tiktok
○ Lainnya
```

#### **Validation Messages:**
```
❌ Section Validation (Next button):
"Mohon lengkapi pertanyaan wajib berikut:
• Domisili
• Nomor Whatsapp"

❌ Final Validation (Submit):
"Masih ada pertanyaan wajib yang belum dijawab:

Basic Information:
• Domisili
• Nomor Whatsapp

Advance Information:
• Social Media yang sering digunakan
"
```

---

## 🔧 **Technical Implementation Details**

### **1. 📊 Data Structure**

#### **Question Group with Mandatory Questions:**
```typescript
const questionGroup: QuestionGroup = {
  id: "group1",
  name: "Basic Information",
  questionIds: ["q1", "q2", "q3", "q4"],
  mandatoryQuestionIds: ["q1", "q3"], // q1=Domisili, q3=Nomor Whatsapp
  isActive: true,
  createdAt: "2025-01-XX",
  updatedAt: "2025-01-XX"
}
```

### **2. 🎨 UI Components**

#### **Create Question Group - Mandatory Checkbox:**
```tsx
{selectedQuestions.includes(question.id) && (
  <div className="ml-4 flex items-center">
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={mandatoryQuestions.includes(question.id)}
        onChange={() => toggleMandatoryQuestion(question.id)}
        className="mr-2"
      />
      <span className="text-xs text-red-600 font-medium">Wajib</span>
    </label>
  </div>
)}
```

#### **Edit Question Group - SortableQuestionItem:**
```tsx
<SortableQuestionItem 
  key={question.id} 
  question={question} 
  index={index} 
  onRemove={onRemoveQuestion} 
  categories={categories}
  isMandatory={formData.mandatoryQuestionIds.includes(question.id)}
  onToggleMandatory={onToggleMandatory}
/>
```

#### **Survey - Mandatory Indicator:**
```tsx
<label className="block font-medium">
  {question.text}
  {currentGroup?.mandatoryQuestionIds?.includes(question.id) && (
    <span className="text-red-500 ml-1">*</span>
  )}
</label>
```

### **3. 🔍 Validation Logic**

#### **Section Validation (Next Button):**
```typescript
const handleNext = () => {
  if (currentGroup?.mandatoryQuestionIds) {
    const unansweredMandatory = currentGroup.mandatoryQuestionIds.filter(questionId => {
      const answer = responses[questionId];
      return !answer || (typeof answer === 'string' && answer.trim() === '');
    });
    
    if (unansweredMandatory.length > 0) {
      // Show error message with specific questions
      alert(`Mohon lengkapi pertanyaan wajib berikut:\n• ${unansweredQuestions.join('\n• ')}`);
      return;
    }
  }
  
  // Proceed to next section
  setCurrentSection(prev => prev + 1);
};
```

#### **Final Validation (Submit):**
```typescript
const handleSubmit = async () => {
  const allUnansweredMandatory: { groupName: string; questions: string[] }[] = [];
  
  assignedGroups.forEach(group => {
    if (group?.mandatoryQuestionIds && group.mandatoryQuestionIds.length > 0) {
      const unansweredMandatory = group.mandatoryQuestionIds.filter(questionId => {
        const answer = responses[questionId];
        return !answer || (typeof answer === 'string' && answer.trim() === '');
      });
      
      if (unansweredMandatory.length > 0) {
        allUnansweredMandatory.push({
          groupName: group.name,
          questions: unansweredQuestions as string[]
        });
      }
    }
  });
  
  if (allUnansweredMandatory.length > 0) {
    // Show comprehensive error message
    return;
  }
  
  // Proceed with submission
};
```

### **4. 🧹 State Management**

#### **Question Selection Handler:**
```typescript
const toggleQuestionSelection = (questionId: string) => {
  setSelectedQuestions(prev => {
    const isCurrentlySelected = prev.includes(questionId);
    if (isCurrentlySelected) {
      // If unselecting question, also remove from mandatory
      setMandatoryQuestions(prevMandatory => 
        prevMandatory.filter(id => id !== questionId)
      );
      return prev.filter(id => id !== questionId);
    } else {
      return [...prev, questionId];
    }
  });
};
```

#### **Mandatory Toggle Handler:**
```typescript
const toggleMandatoryQuestion = (questionId: string) => {
  setMandatoryQuestions(prev => 
    prev.includes(questionId)
      ? prev.filter(id => id !== questionId)
      : [...prev, questionId]
  );
};
```

---

## 📱 **Mobile-Friendly Design**

### **Responsive Layout:**
- ✅ **Touch-Friendly** - Large checkbox areas untuk mobile
- ✅ **Clear Indicators** - Red asterisk dan badge terlihat jelas
- ✅ **Readable Errors** - Error messages yang mudah dibaca di mobile
- ✅ **Accessible** - Proper labels dan ARIA attributes

---

## 🎯 **Benefits**

### **For Admins:**
- ✅ **Granular Control** - Pilih pertanyaan mana yang wajib per grup
- ✅ **Visual Feedback** - Lihat dengan jelas pertanyaan mana yang mandatory
- ✅ **Easy Management** - Checkbox sederhana untuk toggle mandatory status
- ✅ **Data Quality** - Memastikan data penting selalu terisi

### **For Survey Respondents:**
- ✅ **Clear Expectations** - Tahu pertanyaan mana yang wajib dijawab
- ✅ **Progressive Validation** - Error feedback saat navigasi, bukan hanya di akhir
- ✅ **Helpful Messages** - Error message yang spesifik dan actionable
- ✅ **Better UX** - Tidak kehilangan progress karena validation error

### **For System:**
- ✅ **Data Integrity** - Memastikan field penting selalu terisi
- ✅ **Backward Compatible** - Tidak break existing question groups
- ✅ **Performance** - Validation dilakukan client-side untuk response cepat
- ✅ **Scalable** - Mudah ditambahkan ke grup pertanyaan yang sudah ada

---

## 🚀 **Usage Instructions**

### **1. 📝 Creating Question Group with Mandatory Questions:**
1. Buka **Dashboard** → **Pertanyaan** → **Grup Pertanyaan** → **Buat Grup Pertanyaan Baru**
2. Isi **Nama Grup** dan **Deskripsi**
3. **Pilih pertanyaan** dari daftar dengan mencentang checkbox utama
4. Untuk pertanyaan yang dipilih, **centang checkbox "Wajib"** di sebelah kanan jika ingin dijadikan mandatory
5. **Simpan Grup**

### **2. ✏️ Editing Existing Question Group:**
1. Buka **Dashboard** → **Pertanyaan** → **Grup Pertanyaan**
2. Klik **Edit** pada grup yang ingin diubah
3. Di bagian **Pertanyaan Terpilih**, gunakan **checkbox "Wajib"** untuk menandai/tidak menandai pertanyaan sebagai mandatory
4. **Perbarui Grup**

### **3. 📋 Survey Experience:**
1. Responden akan melihat **tanda `*` merah** pada pertanyaan mandatory
2. Saat klik **"Selanjutnya"**, sistem akan **validasi pertanyaan mandatory** di section saat ini
3. Saat **submit survey**, sistem akan **validasi semua pertanyaan mandatory** di seluruh grup
4. **Error message** akan menunjukkan pertanyaan spesifik yang belum dijawab

---

## 🎉 **Result**

**Fitur Mandatory Questions berhasil diimplementasi dengan lengkap!**

### **Key Features:**
- ✅ **Admin Control** - Checkbox mandatory di create/edit question group
- ✅ **Visual Indicators** - Badge "Wajib" dan red asterisk
- ✅ **Smart Validation** - Section-level dan final validation
- ✅ **Clear Feedback** - Specific error messages
- ✅ **Mobile Friendly** - Responsive design
- ✅ **Type Safe** - Full TypeScript support
- ✅ **Backward Compatible** - Tidak break existing data

**Survey sekarang memiliki kontrol mandatory questions yang profesional dan user-friendly!** 🎯