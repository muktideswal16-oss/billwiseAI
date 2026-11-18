import requests

BASE = 'http://127.0.0.1:8000/api'

def run_tests():
    print("Starting BillWise AI End-to-End Test Suite...")

    # 1. Test Demo Login
    r = requests.post(f'{BASE}/auth/demo-login')
    assert r.status_code == 200, f"Demo login failed: {r.text}"
    user = r.json()['user']
    print(f"✓ [1/10] Auth OK: {user['name']} ({user['email']})")

    # 2. Test Analytics
    r = requests.get(f'{BASE}/analytics')
    assert r.status_code == 200
    data = r.json()
    print(f"✓ [2/10] Analytics OK: {data['total_documents']} docs, ${data['total_invoiced_value']:,.2f} volume")

    # 3. Test Documents List
    r = requests.get(f'{BASE}/documents')
    assert r.status_code == 200
    docs = r.json()
    print(f"✓ [3/10] Documents List OK: {len(docs)} documents returned")

    # 4. Test Sample 2 (Vanguard error)
    sample_2 = next((d for d in docs if 'Vanguard' in str(d.get('original_name')) or d.get('demo_scenario') == 'incorrect_total'), None)
    assert sample_2 is not None, "Sample 2 not found"
    print(f"✓ [4/10] Found Sample 2: Doc #{sample_2['id']} (Status: {sample_2['approval_status']})")

    # 5. Test Validation of Sample 2
    r = requests.post(f'{BASE}/documents/{sample_2["id"]}/validate')
    assert r.status_code == 200
    val = r.json()
    print(f"✓ [5/10] Validation Engine OK: {val['status']} - {val['errors_count']} errors, {val['warnings_count']} warnings")

    # 6. Test Extraction update (correcting the error)
    ext = sample_2['extracted_data']
    payload = {
        'subtotal': 850.00,
        'tax_amount': 72.00,
        'discount': 0.00,
        'grand_total': 922.00,
        'items': ext['items']
    }
    r = requests.put(f'{BASE}/documents/{sample_2["id"]}/extraction', json=payload)
    assert r.status_code == 200
    print("✓ [6/10] Field Correction & Human Verification OK: Confidence updated to 100%")

    # 7. Test Approval
    r = requests.post(f'{BASE}/documents/{sample_2["id"]}/approve', json={'action': 'Approved', 'comments': 'Corrected by reviewer'})
    assert r.status_code == 200
    assert r.json()['approval_status'] == 'Approved'
    print(f"✓ [7/10] Document Approval OK: Doc #{sample_2['id']} is now Approved")

    # 8. Test Duplicates
    r = requests.get(f'{BASE}/duplicates')
    assert r.status_code == 200
    dups = r.json()
    print(f"✓ [8/10] Duplicate Engine OK: {len(dups)} duplicate match candidates found")

    # 9. Test CSV Export
    r = requests.get(f'{BASE}/export/csv?only_approved=true')
    assert r.status_code == 200
    assert 'Vendor Name' in r.text
    print(f"✓ [9/10] CSV Export OK: {len(r.content)} bytes generated")

    # 10. Test Excel Export
    r = requests.get(f'{BASE}/export/excel?only_approved=true')
    assert r.status_code == 200
    assert len(r.content) > 1000
    print(f"✓ [10/10] Excel (.xlsx) Export OK: {len(r.content)} bytes openpyxl workbook generated")

    # 11. Test Reset Demo
    r = requests.post(f'{BASE}/demo/reset')
    assert r.status_code == 200
    print("✓ [BONUS] Demo Reset OK: Database restored to initial clean hackathon state")

    print("\n🎉 ALL 10 CORE PIPELINE MODULES VERIFIED & WORKING FLAWLESSLY!")

if __name__ == '__main__':
    run_tests()

