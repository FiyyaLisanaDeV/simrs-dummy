import re

models_to_extract = ['bridging_sep', 'inacbg_klaim_baru', 'penyakit', 'diagnosa_pasien']

with open('/home/gudang-data-kantor/simrs-web/simrs-backend/prisma/schema-introspect.prisma', 'r') as f:
    introspect_content = f.read()

output = []

# Extract models
for model in models_to_extract:
    match = re.search(r'model\s+' + model + r'\s+\{.*?\n\}', introspect_content, re.DOTALL)
    if match:
        model_str = match.group(0)
        # Remove unsupported relations mapping to models we don't have
        lines = model_str.split('\n')
        clean_lines = []
        for line in lines:
            if '@relation' in line and not ('bridging_sep_ibfk_1' in line or 'inacbg_klaim_baru_ibfk_1' in line or 'diagnosa_pasien_ibfk_1' in line or 'diagnosa_pasien_ibfk_2' in line):
                continue
            # Remove fields that point to models we don't have
            if re.search(r'\b(bpjs_prb|bridging_resep_apotek_bpjs|bridging_rujukan_bpjs|bridging_sep_internal|bridging_smart_klaim_bpjs|bridging_srb_bpjs|bridging_srb_bpjs_obat|bridging_surat_kontrol_bpjs|inacbg_data_terkirim|inacbg_grouping_stage1|data_tb|hemodialisa|mapping_penyakit_smart_klaim_bpjs|obat_penyakit|kategori_penyakit|penyakit_pd3i|perkiraan_biaya_ranap|rujuk_masuk|satu_sehat_condition|template_pemeriksaan_dokter_penyakit|temporary_surveilens_penyakit)\b', line):
                continue
            clean_lines.append(line)
        output.append('\n'.join(clean_lines))

# Find all enums used in those models
enums_used = set(re.findall(r'\b([a-zA-Z0-9_]+)\b', '\n'.join(output)))

# Extract enums
for enum in enums_used:
    if enum.startswith('bridging_sep_') or enum.startswith('penyakit_') or enum.startswith('diagnosa_pasien_'):
        match = re.search(r'enum\s+' + enum + r'\s+\{.*?\n\}', introspect_content, re.DOTALL)
        if match:
            output.append(match.group(0))

with open('/home/gudang-data-kantor/simrs-web/simrs-backend/prisma/schema.prisma', 'a') as f:
    f.write('\n\n' + '\n\n'.join(output) + '\n')

print("Models and enums appended to schema.prisma.")
