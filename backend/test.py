#!/usr/bin/env python3
"""
Test script to verify backend APIs work with single country_category_news collection.
Run this to test without needing mongo shell access.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from services.mongo_service import MongoDataApiService


async def test_apis():
    mongo = MongoDataApiService()
    
    if not mongo.configured:
        print("❌ MongoDB not configured. Set MONGO_URI in .env")
        return
    
    print("=" * 60)
    print("Testing Vigil Backend APIs with Single Collection")
    print("=" * 60)
    
    # Test 1: Get all countries
    print("\n📊 TEST 1: GET /api/globe")
    print("-" * 60)
    result = await mongo.get_countries()
    countries = result.get("countries", [])
    print(f"✅ Found {len(countries)} countries")
    
    if countries:
        sample = countries[0]
        print(f"\nSample country:")
        print(f"  ISO3: {sample.get('iso3')}")
        print(f"  Name: {sample.get('name')}")
        print(f"  Index: {sample.get('index_value')}")
        print(f"  Lat/Lng: {sample.get('latitude')}, {sample.get('longitude')}")
    else:
        print("⚠️  No countries found - is your data agent running?")
    
    # Test 2: Get specific country
    if countries:
        test_iso3 = countries[0].get("iso3")
        print(f"\n🔍 TEST 2: GET /api/country/{test_iso3}")
        print("-" * 60)
        
        country = await mongo.get_country(test_iso3)
        if country:
            print(f"✅ Retrieved country: {country.get('name')}")
            print(f"  Index: {country.get('index_value')}")
        else:
            print(f"❌ Country {test_iso3} not found")
    
    # Test 3: Get country details
    if countries:
        test_iso3 = countries[0].get("iso3")
        print(f"\n📰 TEST 3: GET /api/country/{test_iso3}/details")
        print("-" * 60)
        
        details = await mongo.get_country_details(test_iso3)
        if details:
            print(f"✅ Retrieved details for: {details.get('name')}")
            print(f"  Index: {details.get('index_value')}")
            print(f"  Trend: {details.get('trend')}")
            print(f"  Metrics:")
            for key, val in details.get("metrics", {}).items():
                print(f"    - {key}: {val}")
            print(f"  Trending Topics: {len(details.get('trending_topics', []))}")
            print(f"  News Articles: {len(details.get('news_articles', []))}")
            
            if details.get("news_articles"):
                print(f"\n  Sample article:")
                article = details["news_articles"][0]
                print(f"    Title: {article.get('title')}")
                print(f"    Source: {article.get('source')}")
                print(f"    Impact: {article.get('impact_score')}")
        else:
            print(f"❌ Details for {test_iso3} not found")
    
    # Test 4: Get agent news
    if countries:
        test_iso3 = countries[0].get("iso3")
        print(f"\n🤖 TEST 4: GET /api/country/{test_iso3}/agent-news")
        print("-" * 60)
        
        from utils.country_mappings import ISO3_TO_NAME
        country_name = ISO3_TO_NAME.get(test_iso3)
        
        if country_name:
            news = await mongo.get_country_news(country_name)
            print(f"✅ Retrieved {len(news)} categories for {country_name}")
            
            for cat in news:
                print(f"\n  Category: {cat.get('category')}")
                print(f"    Final Score: {cat.get('final_score')}")
                print(f"    Articles: {len(cat.get('articles', []))}")
                print(f"    Summary: {cat.get('summary', 'No summary')[:100]}...")
        else:
            print(f"❌ No mapping found for {test_iso3}")
    
    # Test 5: Check alerts
    print(f"\n🚨 TEST 5: GET /api/alerts/latest")
    print("-" * 60)
    
    alerts = await mongo.latest_alerts()
    print(f"✅ Found {len(alerts)} alerts")
    
    for alert in alerts[:3]:
        print(f"\n  Alert:")
        print(f"    Country: {alert.get('country_name')} ({alert.get('country_iso3')})")
        print(f"    Message: {alert.get('message')}")
        print(f"    Severity: {alert.get('severity')}")
    
    print("\n" + "=" * 60)
    print("✅ All tests complete!")
    print("=" * 60)

    test_iso3 = countries[0].get("iso3")
    country_name = ISO3_TO_NAME.get(test_iso3)
    
    print(f"\n📰 Testing: GET /api/country/{test_iso3}/articles")
    print(f"   Country: {country_name}")
    print("-" * 60)
    
    # Get all category data
    categories = await mongo.get_country_news(country_name)
    
    if not categories:
        print(f"❌ No categories found for {country_name}")
        return
    
    # Simulate what the endpoint does
    all_articles = []
    article_id = 1
    categories_with_articles = []
    
    for cat in categories:
        articles = cat.get("articles", [])
        if not articles:
            continue
            
        categories_with_articles.append({
            "category": cat["category"],
            "article_count": len(articles),
            "final_score": cat.get("final_score", 0),
            "summary": cat.get("summary", ""),
        })
        
        for article in articles:
            if not article.get("title"):
                continue
                
            all_articles.append({
                "id": article_id,
                "title": article.get("title", ""),
                "url": article.get("url", ""),
                "content": article.get("content", "")[:200] + "..." if article.get("content") else "",
                "category": cat["category"],
                "published": cat.get("updated_at", ""),
                "credibility": "verified",
                "impact_score": round(cat.get("final_score", 0)),
            })
            article_id += 1
    
    # Sort by impact score
    all_articles.sort(key=lambda x: x["impact_score"], reverse=True)
    
    print(f"\n✅ RESULTS:")
    print(f"   Total Articles: {len(all_articles)}")
    print(f"   Categories with Articles: {len(categories_with_articles)}")
    
    print(f"\n📊 Categories:")
    for cat in categories_with_articles:
        print(f"   - {cat['category']}: {cat['article_count']} articles (score: {cat['final_score']})")
    
    print(f"\n📄 Top 5 Articles by Impact Score:")
    for i, article in enumerate(all_articles[:5], 1):
        print(f"\n   {i}. [{article['impact_score']}] {article['title'][:80]}")
        print(f"      Category: {article['category']}")
        print(f"      URL: {article['url'][:60]}...")
        if article.get('content'):
            print(f"      Content: {article['content'][:100]}...")
    
    print("\n" + "=" * 60)
    print("✅ Articles endpoint test complete!")
    print("=" * 60)
    
    # Show what the actual API response would look like
    response = {
        "iso3": test_iso3,
        "country": country_name,
        "total_articles": len(all_articles),
        "articles": all_articles[:3],  # Just show first 3
        "categories_with_articles": categories_with_articles,
    }
    
    print(f"\n📤 Sample API Response (first 3 articles):")
    print(f"   iso3: {response['iso3']}")
    print(f"   country: {response['country']}")
    print(f"   total_articles: {response['total_articles']}")
    print(f"   articles: [{len(response['articles'])} shown]")
    print(f"   categories_with_articles: {len(response['categories_with_articles'])}")


if __name__ == "__main__":
    asyncio.run(test_apis())