import feedparser
import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import google.generativeai as genai

load_dotenv()

class FinanceRSSReader:
    def __init__(self, gemini_api_key=None, report_output_dir=None):
        self.sources = {
            "經濟日報-總覽": "https://money.udn.com/rssfeed/news/1001/5588?ch=money",
            "經濟日報-股市": "https://money.udn.com/rssfeed/news/1001/5590?ch=money",
            "自由時報-財經": "https://news.ltn.com.tw/rss/business.xml",
            "科技新報-產業": "https://technews.tw/feed/",
            "ETtoday-財經": "https://feeds.feedburner.com/ettoday/finance"
        }
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
        
        # 初始化 Gemini
        self.gemini_enabled = False
        if gemini_api_key:
            try:
                genai.configure(api_key=gemini_api_key)
                
                # 獲取所有支援 generateContent 的模型
                model_list = list(genai.list_models())
                available_models = [m.name for m in model_list if 'generateContent' in m.supported_generation_methods]
                
                # 優先順序: 越穩定且廣泛支援的模型排越前面
                # 將 1.5-flash 設為首選，因為它是目前最穩定且免費額度充足的簡單模型
                prefs = ['gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro']
                selected_model = None
                
                # 遍歷所有可用模型，排除可能不穩定的版本 (如 2.0-flash 在某些區域報錯)
                for p in prefs:
                    for am in available_models:
                        if p in am:
                            selected_model = am
                            break
                    if selected_model: break

                if not selected_model and available_models:
                    selected_model = available_models[0]
                
                if selected_model:
                    # 這裡使用完整的模型名稱 (通常包含 models/ 前綴)
                    self.model = genai.GenerativeModel(selected_model)
                    self.gemini_enabled = True
                else:
                    print("您的 API Key 似乎沒有可用的生成模型，請檢查權限。")
                    print(f"可用的模型清單: {available_models}")
                    
            except Exception as e:
                print(f"Gemini 初始化失敗: {e}")
                print("提示: 請檢查 API Key 是否正確，以及是否已在 Google AI Studio 啟用 Gemini API。")
        self.report_output_dir = report_output_dir

    def fetch_news(self, source_name):
        url = self.sources.get(source_name)
        if not url:
            return []

        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            feed = feedparser.parse(response.content)
            today = datetime.now().date()
            
            news_items = []
            for entry in feed.entries:
                published_time = None
                if hasattr(entry, 'published_parsed') and entry.published_parsed:
                    published_time = datetime(*entry.published_parsed[:6]).date()
                
                if published_time and published_time != today:
                    continue

                news_items.append({
                    'source': source_name,
                    'title': entry.title,
                    'link': entry.link,
                    'published': getattr(entry, 'published', '未知時間'),
                    'summary': getattr(entry, 'summary', '')[:200] if hasattr(entry, 'summary') else ""
                })
            return news_items
        except Exception as e:
            print(f"擷取 {source_name} 時發生錯誤: {e}")
            return []

    def get_all_today_news(self):
        all_news = []
        for source in self.sources.keys():
            all_news.extend(self.fetch_news(source))
        return all_news

    def analyze_trends(self, news_list):
        if not self.gemini_enabled or not news_list:
            print("Gemini 未啟用或今日無新聞可供分析。")
            return

        print("\n正在使用 Gemini 分析今日財經趨勢...")
        
        # 整理新聞內容給 Gemini
        news_context = "\n".join([f"- [{n['source']}] {n['title']}: {n['summary']}" for n in news_list])
        
        prompt = f"""
        你是一位專業的財經分析師。以下是今日（{datetime.now().date()}）從各大財經媒體彙整的新聞摘要：

        {news_context}

        請根據以上資訊，為我整理並歸納出：
        1. **今日核心話題**：目前市場最關注的 2-3 個大事件。
        2. **主要投資題材**：哪些產業或個股是今日的盤面焦點？
        3. **市場趨勢觀察**：從這些新聞中觀察到的未來發展方向或風險提示。
        4. **個股分析**：針對上述提到的產業/趨勢中，可能相關的個股(包含代碼與股名)進行分析，包括其基本面以及牽連程度。
        請使用繁體中文，以條列式清晰呈現。
        """
        
        try:
            response = self.model.generate_content(prompt)
            analysis_result = response.text
            
            # 顯示於終端機
            print("\n" + "="*30)
            print("🚀 Gemini 今日財經趨勢分析")
            print("="*30)
            print(analysis_result)
            print("="*30)

            # 產生成報告檔案
            today_str = datetime.now().strftime("%Y-%m-%d")
            filename = f"{today_str}_trend_report.md"
            
            # Construct full path
            full_output_path = filename
            if self.report_output_dir:
                os.makedirs(self.report_output_dir, exist_ok=True) # Ensure directory exists
                full_output_path = os.path.join(self.report_output_dir, filename)

            with open(full_output_path, "w", encoding="utf-8") as f:
                f.write(f"# 今日財經趨勢報告 ({today_str})\n\n")
                f.write(analysis_result)
                f.write("\n\n## 參考新聞來源清單\n")
                for n in news_list:
                    f.write(f"- [{n['source']}] {n['title']}\n")
            
            print(f"\n✅ 趨勢報告已生成並儲存至: {full_output_path}")
            
        except Exception as e:
            print(f"Gemini 分析時發生錯誤: {e}")

    def display_news(self, source_name, limit=5):
        news = self.fetch_news(source_name)
        if not news:
            print(f"\n=== {source_name} ===\n今日暫無更新新聞。")
            return

        print(f"\n=== {source_name} (今日最新 {len(news[:limit])} 則) ===")
        for i, item in enumerate(news[:limit], 1):
            print(f"{i}. [{item['published']}] {item['title']}")
            print("-" * 50)

if __name__ == "__main__":
    # 建議設定環境變數 "GEMINI_API_KEY" 來使用分析功能
    # 您可以在這裡填入您的 Gemini API Key，或設定環境變數
    API_KEY = os.getenv("GEMINI_API_KEY")
    
    # 新增一個可選的報告輸出目錄
    REPORT_DIR = "/obsidian/drive/Obsidian/obsidian/finance"
    # 或者從環境變數讀取：REPORT_DIR = os.getenv("REPORT_OUTPUT_DIR")
    # REPORT_DIR = None # 預設為 None，即輸出到目前目錄
    
    reader = FinanceRSSReader(gemini_api_key=API_KEY, report_output_dir=REPORT_DIR)
    
    # 1. 獲取所有今日新聞
    today_news = reader.get_all_today_news()
    
    # 2. 顯示個別來源 (選選)
    reader.display_news("經濟日報-股市")
    
    # 3. 使用 Gemini 進行總結與趨勢分析
    if API_KEY:
        reader.analyze_trends(today_news)
    else:
        print("\n提示: 未設定 GEMINI_API_KEY，跳過趨勢分析功能。")
