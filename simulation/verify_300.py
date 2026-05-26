import urllib.request
import json
import time

BASE_URL = 'http://localhost:4000'

success_count = 0
fail_count = 0
errors = []

print("Starting 300 logic tests...")

for i in range(1, 301):
    no_rawat = f"2026/02/23/{str(i + 100).zfill(6)}"
    # encode the slash
    encoded_no_rawat = no_rawat.replace('/', '%2F')

    try:
        req = urllib.request.Request(f"{BASE_URL}/kasir/tagihan/{encoded_no_rawat}", method="GET")
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            total_tagihan = res['grandTotal']
            
            # Now try to pay it
            req_pay = urllib.request.Request(f"{BASE_URL}/kasir/bayar", method="POST", data=json.dumps({
                "no_rawat": no_rawat,
                "nominal_bayar": total_tagihan
            }).encode('utf-8'), headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(req_pay) as response_pay:
                res_pay = json.loads(response_pay.read().decode('utf-8'))
                if res_pay.get('success'):
                    success_count += 1
                else:
                    fail_count += 1
                    errors.append(f"Failed payment for {no_rawat}: {res_pay.get('message')}")
    except Exception as e:
        fail_count += 1
        # Extract response text if possible
        err_msg = str(e)
        if hasattr(e, 'read'):
            err_msg += " " + e.read().decode('utf-8')
        errors.append(f"Exception for {no_rawat}: {err_msg}")
    
    if i % 50 == 0:
        print(f"Processed {i}/300 ...")
        time.sleep(1)

print("\n--- TEST RESULTS ---")
print(f"Total Success: {success_count}")
print(f"Total Failed: {fail_count}")
if fail_count > 0:
    print("Errors:")
    for err in errors[:10]:
        print(" -", err)
    if len(errors) > 10:
        print(f" ... and {len(errors) - 10} more errors.")

with open("dummy_test_report.json", "w") as f:
    json.dump({
        "success": success_count,
        "failed": fail_count,
        "errors": errors
    }, f, indent=4)
