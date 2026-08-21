#!/bin/bash
n=0; ok=0; fail=0
while read -r u; do
  rel="${u#https://keifaldiafa.com/images/}"
  out="dl/${rel//\//__}"
  [ -s "$out" ] && { ok=$((ok+1)); continue; }
  code=$(curl -sL --max-time 20 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" -e "https://keifaldiafa.com/" "$u" -o "$out" -w '%{http_code}')
  if [ "$code" = "200" ] && [ -s "$out" ]; then ok=$((ok+1)); else fail=$((fail+1)); rm -f "$out"; fi
  n=$((n+1))
  [ $((n % 40)) -eq 0 ] && echo "  … $n done (ok=$ok fail=$fail)"
done < keif_imgs.txt
echo "TOTAL ok=$ok fail=$fail"
